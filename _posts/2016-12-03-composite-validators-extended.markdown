---
layout:     post
title:      "Extending your Composite Validators - Part 1"
subtitle:   "Returning multiple errors"
date:       2016-12-03 12:00:00
featured_image: "/images/post-extending-composite-validator-bg.jpg"
published: true
---

<p class="post-padding">&nbsp;</p>

If you haven't read [my post on Composite Validators](/blog/composite-validators), take a look at that first, as this is going to build off of what was created in that post.

---

### Returning multiple errors in validators

In order to give users the best feedback when validating their input, it may be useful to know everything that's wrong with what they entered, not just the first error encountered. Because of this, the implementation we created before needs to be modified to return multiple errors if the input is invalid.

So what does that look like?

We just have to make some relatively small changes in a few places.

### Validator Protocol

We just need to change the invalid case to return an array of errors:
```swift
enum ValidatorResult {
    case valid
    case invalid(errors: [Error])
}
```

### Individual Validators

These are all still going to return a single error, but they just need to do it as an array of one error. For Example:
```swift
struct PasswordLengthValidator: Validator {

    func validate(_ value: String) -> ValidatorResult {
        if value.characters.count >= 8 {
            return .valid
        } else {
            return .invalid(error: [PasswordValidatorError.tooShort])
        }
    }
}
```

### Composite Validator

This one is essentially just packaging things up a little differently:
```swift
struct CompositeValidator: Validator {

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

We're going to use `reduce` to help with this. It will iterate through all of the validators and call `validate` on them. If it is valid, it will just return whatever the previous result was. If it's invalid, it will return a new error, concatenating the new found errors with any previous ones.

### Example of it used

```swift
let validatorConfigurator = ValidatorConfigurator.sharedInstance
let passwordValidator = validatorConfigurator.passwordValidator()

print(passwordValidator.validate("paSs"))
print(passwordValidator.validate("password"))
print(passwordValidator.validate("passw0rd"))
print(passwordValidator.validate("paSSw0rd"))
```

This will print the output:
```
invalid([PasswordValidatorError.tooShort, PasswordValidatorError.noUppercaseLetter, PasswordValidatorError.noNumber])
invalid([PasswordValidatorError.noUppercaseLetter, PasswordValidatorError.noNumber])
invalid([PasswordValidatorError.noUppercaseLetter])
valid
```

### Conclusion

There are many ways to take this pattern of using composite validators and modify it to fit the different needs an application might have. Being able to return multiple errors can be essential in order to provide useful feedback to users.

Hit me up on twitter or my email linked below with any feedback!

---

Take a look at [Part 2](/blog/composite-validators-extended-part-2) of extending composite validators to take advantage of `OrCompositeValidators`

