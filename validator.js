function Validator(target) {
    var selectorRules = {};

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector))
                return element.parentElement;
            element = element.parentElement;
        }
    }

    // Hàm validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, target.groupSelector).querySelector(target.errorSelector);
        var message;
        var rules = selectorRules[rule.selector];
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    message = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;
                default:
                    message = rules[i](inputElement.value);
            }
            if (message) break;
        }
        if (message) {
            errorElement.innerText = message;
            getParent(inputElement, target.groupSelector).classList.add("invalid");
        }
        else {
            errorElement.innerText = "";
            getParent(inputElement, target.groupSelector).classList.remove("invalid");
        }
        return !message;
    }

    // Xử lí sự kiện validate
    var formElement = document.querySelector(target.form);
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;

            // Kiểm tra validate các trường
            target.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) isFormValid = false;
            });

            // Submit form
            if (isFormValid) {
                if (typeof target.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]");
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case "radio":
                            case "checkbox":
                                if (input.matches(":checked")) {
                                    values[input.name] = input.value;
                                } else {
                                    values[input.name] = input.value || "";
                                }
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    target.onSubmit(formValues);
                }
                else {
                    formElement.submit();
                }
            }
        }
        target.rules.forEach(function(rule) {
            // Đưa các rule cùng 1 selector vào mảng
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.check);
            }
            else {
                selectorRules[rule.selector] = [rule.check];
            }

            // Xử lí sự kiện blur khỏi input và nhập input
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, target.groupSelector).querySelector(target.errorSelector);
                    errorElement.innerText = "";
                    getParent(inputElement, target.groupSelector).classList.remove("invalid");
                }
            });
        })
    }
}

// Định nghĩa luật validate

Validator.isRequired = function(selector, msg) {
    return {
        selector: selector,
        check: function(value) {
            return value ? undefined : msg || "Vui lòng nhập trường này!";
        }
    }
}

Validator.isEmail = function(selector, msg) {
    return {
        selector: selector,
        check: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : msg || "Trường này phải là email!";
        }
    }
}

Validator.isAlpha = function (selector, msg) {
    return {
        selector: selector,
        check: function(value) {
            var regex = /^\w+$/i;
            var result = regex.test(value);
            return result ? undefined : msg || "Tên đăng nhập không hợp lệ!";
        }
    }
}

Validator.minimumLength = function (selector, minValue, msg) {
    return {
        selector: selector,
        check: function(value) {
            return value.length >= minValue ? undefined : msg || `Mật khẩu phải có tối thiểu ${minValue} kí tự!`
        }
    }
}

Validator.isConfirmed = function (selector, getPassword, msg) {
    return {
        selector: selector,
        check: function (value) {
            return value === getPassword() ? undefined : msg || "Giá trị nhập vào không chính xác!";
        }
    }
}