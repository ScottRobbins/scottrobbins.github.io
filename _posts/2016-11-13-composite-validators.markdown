---
layout:     post
title:      "Composite Validators"
subtitle:   "Using the composite pattern to help organize user input validating code"
date:       2016-11-16 12:00:00
featured_image: "/images/post-composite-validator-bg.jpg"
---

### What is the Composite Pattern?

The composite pattern is a design pattern in which a group of objects can be treated the same way as a single object.

The idea is to compose objects into tree structures to represent part-whole hierarchies.

### How is this going to help us with validating user input?

User input fields tend to have many small rules that need to be followed in order for the input to be considered "valid". Using the composite pattern can be an elegant way to break up this code into smaller units, and allow them to be easily added/removed/changed later.

### Our Example

Imagine you have a registration form in your application. Your registration form has 2 input fields:
* Email
* Password

Each of these fields has their own requirements for the user input to be considered "valid".

**Email:**
* Must not be empty
* Must be a valid email format

**Password:**
* Must not be empty
* Must be at least 8 characters long
* Must have one uppercase letter, lowercase letter and a number

### Let's see some code!
In order to set this up, there are a few main sections:
1. [Validator Protocol](#validatorProtocol)
2. [Individual Validators](#individualValidators)
3. [Composite Validator](#compositeValidator)
4. [Validator Configurator](#validatorConfigurator)
5. [Example of it used](#exampleOfItBeingUsed)

### Validator Protocol {#validatorProtocol}
We're going to create a protocol that every validator will conform to (the validators are the objects that will decide if the user input is valid or not).

Before creating the protocol, let's create the result type that will be returned for each validator:
{% highlight swift %}
enum ValidatorResult {
    case valid
    case invalid(error: Error)
}
{% endhighlight %}

Each validator is going to respond with whether the input it was given was valid or not. If it is not valid, it will return some type of error explaining why.

Great, now let's look at this validator protocol.
{% highlight swift %}
protocol Validator {
    func validate(_ value: String) -> ValidatorResult
}
{% endhighlight %}

So, each validator is going to have a function that accepts the input as a `String` and returns a `ValidatorResult`.

Before showing the individual validators, here are the errors that can be specified for invalid inputs:
{% highlight swift %}
enum EmailValidatorError: Error {
    case empty
    case invalidFormat
}

enum PasswordValidatorError: Error {
    case empty
    case tooShort
    case noUppercaseLetter
    case noLowercaseLetter
    case noNumber
}
{% endhighlight %}

### Individual Validators {#individualValidators}

Let's take a look at how these validators are implemented.

##### Empty String Validator
{% highlight swift %}
struct EmptyStringValidator: Validator {

    // This error is passed via the initializer to allow this validator to be reused
    private let invalidError: Error

    init(invalidError: Error) {
        self.invalidError = invalidError
    }

    func validate(_ value: String) -> ValidatorResult {
        if value.isEmpty {
            return .invalid(error: invalidError)
        } else {
            return .valid
        }
    }
}
{% endhighlight %}

##### Email Format Validator
{% highlight swift %}
struct EmailFormatValidator: Validator {
    func validate(_ value: String) -> ValidatorResult {
        let magicEmailRegexStolenFromTheInternet = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"

        let emailTest = NSPredicate(format:"SELF MATCHES %@", magicEmailRegexStolenFromTheInternet)

        if emailTest.evaluate(with: value) {
            return .valid
        } else {
            return .invalid(error: EmailValidatorError.invalidFormat)
        }
    }
}
{% endhighlight %}

##### Password Length Validator
{% highlight swift %}
struct PasswordLengthValidator: Validator {

    func validate(_ value: String) -> ValidatorResult {
        if value.characters.count >= 8 {
            return .valid
        } else {
            return .invalid(error: PasswordValidatorError.tooShort)
        }
    }
}
{% endhighlight %}

##### Uppercase Letter Validator
{% highlight swift %}
struct UppercaseLetterValidator: Validator {

    func validate(_ value: String) -> ValidatorResult {
        let uppercaseLetterRegex = ".*[A-Z]+.*"

        let uppercaseLetterTest = NSPredicate(format:"SELF MATCHES %@", uppercaseLetterRegex)

        if uppercaseLetterTest.evaluate(with: value) {
            return .valid
        } else {
            return .invalid(error: PasswordValidatorError.noUppercaseLetter)
        }
    }
}
{% endhighlight %}

... and just imagine I made a `LowercaseLetterValidator` and a `ContainsNumberValidator`. The implementations would be the same as the `UppercaseLetterValidator`, just with different regex.

### Composite Validator {#compositeValidator}

The whole idea behind this is that we will be able to compose all of those individual validators into a larger tree of validators and allow this tree to be used in the same way as if it were a leaf.

To do this, we are going to create the `CompositeValidator`. This validator is going to be initialized with an array of validators. When it is called to validate, it will iterate through them and ask each individual one to validate the input.

For the sake of simplicity, it is just going to return the first invalid response. (You could, however, change the logic so that validators return arrays of errors for invalid responses, [which I wrote about in this post](/2016/12/03/composite-validators-extended/))

{% highlight swift %}
struct CompositeValidator: Validator {

    private let validators: [Validator]

    init(validators: Validator...) {
        self.validators = validators
    }

    func validate(_ value: String) -> ValidatorResult {

        for validator in validators {
            switch validator.validate(value) {
            case .valid:
                break
            case .invalid(let error):
                return .invalid(error: error)
            }
        }

        return .valid
    }
}
{% endhighlight %}

Now we have all of the parts needed to compose the different validators, let's create a configurator class to do that work.

### Validator Configurator {#validatorConfigurator}

This is a helper class to make the code easy to read, use, and change later.

{% highlight swift %}
struct ValidatorConfigurator {

    // Interface

    static let sharedInstance = ValidatorConfigurator()

    func emailValidator() -> Validator {
        return CompositeValidator(validators: emptyEmailStringValidator(),
                                  EmailFormatValidator())
    }

    func passwordValidator() -> Validator {
        return CompositeValidator(validators: emptyPasswordStringValidator(),
                                  passwordStrengthValidator())
    }

    // Helper methods

    private func emptyEmailStringValidator() -> Validator {
        return EmptyStringValidator(invalidError: EmailValidatorError.empty)
    }

    private func emptyPasswordStringValidator() -> Validator {
        return EmptyStringValidator(invalidError: PasswordValidatorError.empty)
    }

    private func passwordStrengthValidator() -> Validator {
        return CompositeValidator(validators: PasswordLengthValidator(),
                                  UppercaseLetterValidator(),
                                  LowercaseLetterValidator(),
                                  ContainsNumberValidator())
    }
}
{% endhighlight %}

You can see that both the email and password validators are actually just composites of other validators. And even the "passwordStrengthValidator" is a composite.

<br />
**Email Validator**

![Email Validator Diagram](/images/emailValidator.png)

<br />
**Password Validator**

![Password Validator Diagram](/images/passwordValidator.png)

### Example of it used {#exampleOfItBeingUsed}

<p>
    {% highlight swift %}
    let validatorConfigurator = ValidatorConfigurator.sharedInstance
    let emailValidator = validatorConfigurator.emailValidator()
    let passwordValidator = validatorConfigurator.passwordValidator()

    print(emailValidator.validate(""))
    print(emailValidator.validate("invalidEmail@"))
    print(emailValidator.validate("validEmail@validDomain.com"))

    print(passwordValidator.validate(""))
    print(passwordValidator.validate("psS$"))
    print(passwordValidator.validate("passw0rd"))
    print(passwordValidator.validate("paSSw0rd"))
    {% endhighlight %}
</p>

This will print the output:
```
invalid(EmailValidatorError.empty)
invalid(EmailValidatorError.invalidFormat)
valid
invalid(PasswordValidatorError.empty)
invalid(PasswordValidatorError.tooShort)
invalid(PasswordValidatorError.noUppercaseLetter)
valid
```

### Conclusion

I think this is an interesting way to organize user input validating code. It provides a way to break up code into smaller, succinct units, and makes it simple to change code later.

If you have any comments/suggestions, hit me up on twitter or my email linked below!

---

Make sure to read [Part 1](/2016/12/03/composite-validators-extended) and [Part 2](/2016/12/12/composite-validators-extended-part-2/) to find out how to extend your composite validators to be more powerful.

---

**Update:** After some feedback, I changed some of the code to be more "_swifty_"


