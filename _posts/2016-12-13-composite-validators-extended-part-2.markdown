---
layout:     post
title:      "Extending your Composite Validators - Part 2"
subtitle:   "Separating AndCompositeValidator and OrCompositeValidator"
date:       2016-12-12 12:00:00
featured_image: "/images/post-extending-composite-validator-part-2-bg.jpg"
published: true
---

<p class="post-padding">&nbsp;</p>

If you haven't read [my post on Composite Validators](/blog/composite-validators/) and [my post on returning multiple errors from them](/blog/composite-validators-extended/), take a look at those first, as this is going to build off of what was created in those posts.

---

### What's the problem?

All of the user input we have been validating thus far had rules that were all required to pass in order for the input to be valid. A password had to have a lowercase letter **and** an uppercase letter **and** a number.

There are many scenarios in which you may only need some combination of the validators to pass in order for the input to be considered valid. For example: perhaps you have a field for a phone number that is optional. If they enter a phone number, you want to make sure it's the correct number of digits, correct characters, etc. However, if they don't enter anything at all, that is also valid.

You want the phone number to be valid **or** an empty phone number.

### Our Example

The example I'm going to show will expand upon the password validator, since by now you are familiar with that and more importantly I am lazy.

As a refresh on the requirements for passwords, they:
* Must not be empty
* Must be at least 8 characters long
* Must have one uppercase letter, lowercase letter and a number

I'm going to expand that last rule to be:
* Must have one uppercase letter
* Must have one lowercase letter
* Must have either a number **or** a special character

### And Composite Validator

What we were previously calling `CompositeValidator` I am just going to rename to `AndCompositeValidator`.

```swift
struct AndCompositeValidator: Validator {

    private let validators: [Validator]

    init(validators: Validator...) {
        self.validators = validators
    }

    func validate(_ value: String) -> ValidatorResult {
        return validators.reduce(.valid) { validatorResult, validator in
            switch validator.validate(value) {
            case .valid:
                return validatorResult
            case .invalid(let validatorErrors):
                switch validatorResult {
                case .valid:
                    return .invalid(errors: validatorErrors)
                case .invalid(let validatorResultErrors):
                    return .invalid(errors: validatorResultErrors + validatorErrors)
                }
            }
        }
    }
}
```

### Or Composite Validator

For this one, if any of the validators passed in return a valid result, than the `OrCompositeValidator` will return that the input is valid. Otherwise, every error will be returned in the array with the invalid response.

```swift
struct OrCompositeValidator: Validator {

    private let validators: [Validator]

    init(validators: Validator...) {
        self.validators = validators
    }

    func validate(_ value: String) -> ValidatorResult {
        return validators.reduce(.invalid(errors: [])) { validatorResult, validator in
            guard case .invalid(let validatorResultErrors) = validatorResult else {
                return .valid
            }

            switch validator.validate(value) {
            case .valid:
                return .valid
            case .invalid(let validatorErrors):
                return .invalid(errors: validatorResultErrors + validatorErrors)
            }
        }
    }
}
```

### Validator Configurator

This is just a class I use to instantiate validators.

```swift
struct ValidatorConfigurator {

    // Interface

    static let sharedInstance = ValidatorConfigurator()

    func passwordValidator() -> Validator {
        return AndCompositeValidator(validators: emptyPasswordStringValidator(),
                                  passwordStrengthValidator())
    }

    // Helper methods

    private func emptyPasswordStringValidator() -> Validator {
        return EmptyStringValidator(invalidError: PasswordValidatorError.empty)
    }

    private func passwordStrengthValidator() -> Validator {
        return AndCompositeValidator(validators: PasswordLengthValidator(),
                                  UppercaseLetterValidator(),
                                  LowercaseLetterValidator(),
                                  numberOrSpecialCharacterValidator())
    }

    private func numberOrSpecialCharacterValidator() -> Validator {
        return OrCompositeValidator(validators: ContainsNumberValidator(),
                                    ContainsSpecialCharacterValidator())
    }
}
```

I didn't bother showing the special character validator. It's very similar to the others, just different regex.

### Example of it used

```swift
let validatorConfigurator = ValidatorConfigurator.sharedInstance
let passwordValidator = validatorConfigurator.passwordValidator()

print(passwordValidator.validate("Password"))
print(passwordValidator.validate("Password1"))
print(passwordValidator.validate("Password$"))
print(passwordValidator.validate("Password1$"))
```

This will print the output:
```
invalid([PasswordValidatorError.noNumber, PasswordValidatorError.noSpecialCharacter])
valid
valid
valid
```

### Conclusion

There are many modifications and additions that can be added to this pattern to make it more powerful and fit the needs of an application. To get more ideas, you can look at Microsoft's [specification pattern](https://en.wikipedia.org/wiki/Specification_pattern), which is what a lot of this is based on.

This is going to end my series on composite validators. Hope you found it interesting. Tag me on twitter or email me with any feedback!

