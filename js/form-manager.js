var language = $("html").attr('lang');
var config = {};

$.getJSON('/system/languages/' + language + '.json', function (data) {
    config = data;

    $(document).trigger('language_config_loaded');
});

/*
@param containerId - A formot tartalmazó elem azonosítója
Átalakítja az adatmezőket beviteli mezőkké.
*/
function createInputFields(containerId) {
    var initvalue, type, name, label, formname;

    $("#" + containerId + " input#edit").attr("disabled", "disabled").hide();

    formname = (typeof($("#" + containerId + " > ul").parents("form").attr('name')) != "undefined" && $("#" + containerId + " > ul").parents("form").attr('name') != false) ? $("#" + containerId + " > ul").parents("form").attr('name') : "form";

    //Végigmegyünk a tárolóban elhelyezkedő összes mezőn
    $("#" + containerId + " > ul > li").each(function () {
        name = $(this).attr("data-name");
        //label = $(this).attr("data-label");
        label = (typeof($(this).attr('data-label')) != "undefined" && $(this).attr('data-label') !== false) ? $(this).attr('data-label') : "";
        type = $(this).attr("data-type");
        initvalue = (typeof($(this).attr("data-value")) != "undefined") ? ($(this).attr("data-value").length > 0) ? $(this).attr("data-value") : "" : "";

        //Utólagos data attribútumok
        var info = (typeof($(this).attr('data-info')) != "undefined" && $(this).attr('data-info') !== false) ? $(this).attr('data-info') : "";
        var placeholder = (typeof($(this).attr('data-placeholder')) != "undefined" && $(this).attr('data-placeholder') !== false) ? $(this).attr('data-placeholder') : "";
        var unit = (typeof($(this).attr('data-unit')) != "undefined" && $(this).attr('data-unit') !== false) ? $(this).attr('data-unit') : "";
        var readonly = (typeof($(this).attr("data-readonly")) != "undefined") ? ($(this).attr("data-readonly").length > 0) ? $(this).attr("data-readonly") : "" : "";

        switch (type) {
            case "select":
                var selectsource, valueid, optionlabel;
                if (readonly.length > 0) selectsource = "<label>" + label + "</label><select name='" + name + "' disabled>";
                else selectsource = "<label>" + label + "</label><select name='" + name + "'>";
                //Végigmegyünk az összes selectnek szánt elemen és sorban átalakítjuk őket
                $(this).find($("ul > li")).each(function () {
                    valueid = $(this).attr("data-value");
                    optionlabel = $(this).attr("data-label");
                    //Ha éppen ez az eset van kiválasztva, akkor beállítjuk kiválasztottnak
                    if (valueid == initvalue) selectsource += "<option value='" + valueid + "' selected='selected'>" + optionlabel + "</option>";
                    else selectsource += "<option value='" + valueid + "'>" + optionlabel + "</option>";
                });
                selectsource += "</select>";
                $(this).html(selectsource);
                break;

            case "checkbox":
                var name, checkboxvalue, label, i;
                i = $("[data-name='" + name + "'] ul > li > input[type='checkbox']").length;
                //Végigmegyünk az összes checkboxnak szánt elemen és sorban átalakítjuk őket
                $(this).find($("ul > li")).each(function () {
                    label = $(this).attr("data-label");
                    checkboxvalue = $(this).attr("data-value");

                    var nrcheckbox = ($(this).attr('data-id') > 0) ? $(this).attr('data-id') : i;

                    if (checkboxvalue == 1) $(this).html("<input name='" + name + nrcheckbox + "' id='" + name + nrcheckbox + "' type='checkbox' checked='checked' /><label for='" + name + nrcheckbox + "'><span></span>" + label + "</label>");
                    else $(this).html("<input name='" + name + nrcheckbox + "' id='" + name + nrcheckbox + "' type='checkbox' /><label for='" + name + nrcheckbox + "'><span></span>" + label + "</label>");
                    i++;
                });
                break;

			case "textarea": $(this).html("<label>"+label+"</label><textarea name='"+name+"' placeholder='"+placeholder+"'>"+initvalue+"</textarea>"); break;

            default:
                if (readonly.length > 0) $(this).html("<label>" + label + "</label><input name='" + name + "' placeholder='" + placeholder + "' value='" + initvalue + "' type='" + type + "' readonly='true' /><div class='input__unit'>" + unit + "</div>");
                else $(this).html("<label>" + label + "</label><input name='" + name + "' placeholder='" + placeholder + "' value='" + initvalue + "' type='" + type + "' /><div class='input__unit'>" + unit + "</div>");

                break;
        }
    });

    //Körbevesszük divvel a li elemeket, amiket kell
    $("#" + containerId + " ul > li[data-placeholder='min']").each(function () {
        $(this).next('li').addBack().wrapAll('<li data-type="minmax"><ul>');
    });

    //A checkboxokat a lista végére rakjuk
    $("#" + containerId + " ul[data-checkbox-grouping='true'] > li[data-type='checkbox']").each(function () {
        var $this = $(this);
        $this.insertAfter($this.siblings(':last'));
    });

    var checkboxButtonName = ($("#" + containerId + " ul[data-checkbox-grouping='true']").length > 0) ? $("#" + containerId + " ul[data-checkbox-grouping='true']").attr('data-checkbox-button-name') : "További szűrők";
    $("#" + containerId + " ul[data-checkbox-grouping='true'] > li[data-type='checkbox']").wrapAll("<div data-name='checkboxcontainer' class='hidden'>");
    if ($("#" + containerId + " ul[data-checkbox-grouping='true']").length > 0) $("[data-name='checkboxcontainer']").before("<span class='button-base--primary' data-action='showcheckboxcontainer'><svg><use xlink:href='design/svg/all.svg#arrow-down-icon'/></svg>" + checkboxButtonName + "</span>");

    //Megjelenítjük a tárolóban található mentés gombot
    $("#" + containerId + " input#save").attr("disabled", false).show();

    //Beállítjuk a karakterszámlálókat, ahol kellenek
    setCounters();
}


/*
@param containerId - A formot tartalmazó elem azonosítója
@return Visszatér egy objektummal, ami az űrlap adatait tartalmazza
*/
function getDataFromInputFields(containerId) {
    var data = {};
    var type, name;
    $("#" + containerId + " > ul > li").each(function () {
        name = $(this).attr("data-name");
        type = $(this).attr("data-type");

        switch (type) {
            case "select":
                data[name] = $(this).find($("select[name='" + name + "']")).val();
                break;

            case "checkbox":
                var checkboxIds = new Array();
                var comma = false;

                $(this).find($("ul > li > input")).each(function () {
                    if (parseInt($(this).parent().attr('data-id')) > 0) {
                        comma = true;
                        if ($(this).prop('checked') === true) checkboxIds.push($(this).parent().attr('data-id'));
                    }
                    else {
                        if ($(this).prop('checked') === true) checkboxIds.push("1");
                        else checkboxIds.push("0");
                    }
                });

                if (comma === true) {
                    if (data[name] != null && checkboxIds.length > 0) data[name] += ',' + checkboxIds.join(',');
                    else if (checkboxIds.length > 0) data[name] = checkboxIds.join(',');
                }
                else {
                    if (data[name] != null && checkboxIds.length > 0) data[name] += checkboxIds.join('');
                    else data[name] = checkboxIds.join('');
                }
                break;

            case "textarea":
                data[name] = $(this).find($("textarea[name='" + name + "']")).val();
                break;

            case "minmax":
                $(this).find('ul > li').each(function () {
                    var input = ($(this).find('input').length > 0) ? true : false;

                    if (input === true) {
                        if (numberWithoutPoints($(this).find('input').val()) != '0') {
                            var name = $(this).attr('data-name');
                            data[name] = numberWithoutPoints($(this).find('input').val());

                            if (typeof($(this).attr('data-multiplicator')) != 'undefined' && $(this).attr('data-multiplicator') !== false) {
                                var multiplicator = parseInt($(this).attr('data-multiplicator'));
                                data[name] = parseFloat(data[name].replace(',', '.'));
                                data[name] = data[name] * multiplicator;
                            }
                        }
                    }
                    else {
                        var name = $(this).attr('data-name');
                        data[name] = $(this).find('select').val();
                    }
                });
                break;

            default:
                if (typeof($(this).attr('data-numberwithpoints')) != 'undefined' && $(this).attr('data-numberwithpoints') !== false) {
                    data[name] = numberWithoutPoints($(this).find($("input[name='" + name + "']")).val());
                }
                else {
                    data[name] = $(this).find($("input[name='" + name + "']")).val();
                }

                if (typeof($(this).attr('data-multiplicator')) != 'undefined' && $(this).attr('data-multiplicator') !== false) {
                    var multiplicator = parseInt($(this).attr('data-multiplicator'));
                    data[name] = data[name] * multiplicator;
                }
                break;
        }
    });

    //Ha a checkboxok csoportosítása be van kapcsolva, akkor onnan is kiolvassuk az értékeket
    if ($("#" + containerId + " [data-name='checkboxcontainer']").length > 0) {
        //Végigmegyünk az összes CB-on
        $("#" + containerId + " [data-name='checkboxcontainer'] input[type='checkbox']").each(function () {
            var name = $(this).parents("[data-type='checkbox']").attr('data-name');
            if ($(this).prop('checked') === true) data[name] = 1;
            else data[name] = 0;
        });
    }

    return data;
}

/*
@param containerId - A formot tartalmazó elem azonosítója
@param data - Az új értékek, amelyeket beállítunk
Visszaalakítja a tárolót az eredeti állapotba
*/
function restoreDataFields(containerId) {
    //Végigmegyünk az egész formon, és visszaállítjuk a frissített adatokkal
    $("#" + containerId + " > ul > li").each(function () {
        var type = $(this).attr("data-type");
        var name = $(this).attr("data-name");
        var columnLabel = $(this).attr("data-label");

        switch (type) {
            case "select":
                var selectedValue = $(this).find($("select[name='" + name + "']")).val();
                var selectedLabel = $(this).find($("select[name='" + name + "'] > option[value='" + selectedValue + "']")).text();
                $(this).attr("data-value", selectedValue);

                var html = columnLabel + " <span>" + selectedLabel + "</span><ul class='hidden'>";

                //A lista visszaállítása
                $(this).find("select[name='" + name + "'] > option").each(function () {
                    var label = $(this).text();
                    var value = $(this).attr("value");
                    html += "<li data-label='" + label + "' data-value='" + value + "'></li>";
                });
                html += "</ul>";
                $(this).html(html);
                break;

            case "checkbox":
                var valueSum = "";
                $(this).find($("ul > li")).each(function () {
                    var value = ($(this).find($("input")).attr("checked") == "checked") ? 1 : 0;
                    $(this).attr("data-value", value);
                    $(this).html($(this).attr("data-label"));
                    valueSum += value;
                });
                $(this).attr("data-value", valueSum);
                break;

            case "textarea":
                var value = $(this).find("textarea[name='" + name + "']").val();
                $(this).attr("data-value", value);
                $(this).html(columnLabel + " <span>" + value + "</span>");
                break;

            default:
                var value = $(this).find("input[name='" + name + "']").val();
                $(this).attr("data-value", value);
                $(this).html(columnLabel + " <span>" + value + "</span>");
                break;
        }
    });
}

/*
@param containerId - A formot tartalmazó elem azonosítója
@pathToSave - A mentést végző szkript elérési útja
@dataToExtend - Kiegészítés az adatokhoz - a feldolgozást segítheti - Opcionális
Elküldi a pathToSave-nek a paraméterként kapott adatokat,
és ha sikeres volt a mentés, akkor visszalakítja a kinézetet.
*/
function save_data(data, pathToSave, containerId, dataToExtend) {
    var message = "";

    //Letiltjuk és eltüntetjük a mentés gombot
    $("#" + containerId + " input#save").attr("disabled", "disabled").hide();

    //Ha van kiegészítendő adat, akkor kiegészítjük az adat objektumot
    if (typeof(dataToExtend) !== 'undefined') $.extend(data, dataToExtend);

    //Elindítjuk az ajax kérést
    $.ajax({
        url: pathToSave,
        type: "POST",
        dataType: "JSON",
        data: data,
        success: function (response) {
            if (response.status == "success") {
                restoreDataFields(containerId, data);
                $("#" + containerId + " input#edit").attr("disabled", false).show();
            }
            else
                message = response.message;
        },
        async: false
    });

    return message;
}

//Substitues the placeholders for a message
function getMessage(parameters) {
    var message = parameters.message;
    var language_code = parameters.language_code;

    message = message.replace('%singular%', config[language_code + '-singular']);
    message = message.replace('%plural%', config[language_code + '-plural']);
    message = message.replace('%accusative%', config[language_code + '-accusative']);
    if (typeof parameters.number !== 'undefined') message = message.replace('%number%', parameters.number);

    //Make first character uppercase
    message = message.charAt(0).toUpperCase() + message.slice(1);

    return message;
}


/*
@param name - az adat neve pl. jelszó, e-mail cím stb.
@param inputName - az első input mező neve
@param minLength - az adat minimális hossza - opcionális
@param maxLength - az adat maximális hossza - opcionális
@param pattern - adatminta - opcionális
*/
function checkInputData(inputName, minLength, maxLength, pattern, minValue, maxValue) {
    var language_code = $("input[name='" + inputName + "']").parent().attr('data-language-code');
    var message = '';
    var value = ($("input[name='" + inputName + "']").val()) ? $("input[name='" + inputName + "']").val() : "";
    errorMessages = new Array();

    if (value.length == 0 && (minLength != null || maxLength != null || pattern != null || minValue != null || maxValue != null)) {
        message = config['error__empty-field'];
        message = getMessage({language_code: language_code, message: message});
        errorMessages.push(message);
    }
    else {
        message = config['error__too-short'];

        //Ha van beállítva minimum hosszúság, akkor ellenőrizzük.
        if (typeof(minLength) !== 'undefined' && minLength != null) {
            if (value.length < minLength) {
                errorMessages.push(getMessage({language_code: language_code, message: message, number: minLength}));
            }
        }

        //Ha van beállítva maximum hosszúság, akkor ellenőizzük.
        message = config['error__too-long'];
        if (typeof(maxLength) !== 'undefined' && maxLength != null) {
            if (value.length > maxLength) {
                errorMessages.push(getMessage({language_code: language_code, message: message, number: maxLength}));
            }
        }

        //Megnézzük, hogy nagyobb-e a minimum értéknél
        message = config['error__too-small'];
        if (typeof(minValue) !== 'undefined' && minValue != null) {
            var intvalue = parseInt(value);
            if (intvalue < minValue){
                errorMessages.push(getMessage({language_code: language_code, message: message, number: minValue}));
            }
        }

        //Megnézzük, hogy kisebb-e a maximum értéknél
        message = config['error__too-big'];
        if (typeof(maxValue) !== 'undefined' && maxValue != null) {
            var intvalue = parseInt(value);
            if (intvalue > maxValue){
                errorMessages.push(getMessage({language_code: language_code, message: message, number: maxValue}));
            }
        }

        //Megnézzük, hogy illeszkedik-e a megadott mintára
        message = config['error__not-match-pattern'];
        if (typeof(pattern) !== 'undefined' && pattern != null) {
            var regexPattern = new RegExp(pattern);
            if (!regexPattern.test(value))
                errorMessages.push(getMessage({language_code: language_code, message: message}));
        }
    }

    return errorMessages;
}


function checkTextareaData(textareaName, minLength, maxLength) {
    var language_code = $("[name='" + textareaName + "']").parent().attr('data-language-code');
    var message = '';
    var value = $("textarea[name='" + textareaName + "']").val();
    var errorMessages = new Array();

    if (value.length == 0 && (minLength != null || maxLength != null)) {
        message = config['error__empty-field'];
        message = getMessage({language_code: language_code, message: message});
        errorMessages.push(message);
    }
    else{
        //Ha van beállítva minimum hosszúság, akkor ellenőrizzük.
        message = config['error__too-short'];
        if (typeof(minLength) !== 'undefined' && minLength != null) {
            if (value.length < minLength) {
                errorMessages.push(getMessage({language_code: language_code, message: message, number: minLength}));
            }
        }

        //Ha van beállítva maximum hosszúság, akkor ellenőizzük.
        message = config['error__too-long'];
        if (typeof(maxLength) !== 'undefined' && maxLength != null) {
            if (value.length > maxLength) {
                errorMessages.push(getMessage({language_code: language_code, message: message, number: maxLength}));
            }
        }
    }

    return errorMessages;
}

function checkSelectData(selectName) {
    var language_code = $("[name='" + selectName + "']").parent().attr('data-language-code');
    var value = $("select[name='" + selectName + "']").val();
    var errorMessages = new Array();

    if (value == 0 && $("select[name='" + selectName + "'] option").length > 1){
        message = config['error__select-required'];
        errorMessages.push(getMessage({language_code: language_code, message: message}));
    }

    return errorMessages;
}

/*
@param containerId - A tároló elem azonosítója
@param inputName - Az input name attribútuma
@param errorMessages - A megjelenítendő hibaüzenetek
*/
function updateErrorList(inputName, errorMessages) {
    if (errorMessages.length == 0) $("[name='" + inputName + "']").removeClass('error-input');

    //Megnézzük, hogy a tárolóban van-e már hibalista
    if ($("ul.errorlist").length > 0) {
        $("ul.errorlist").removeClass("hidden");
        //Megnézzük, hogy van-e megjelenítendő hibaüzenet, majd frissítjük a listát.
        if (errorMessages.length > 0) {
            for (i = 0; i < errorMessages.length; i++) {
                var contains = false;
                $("ul.errorlist > li[data-name='" + inputName + "']").each(function () {
                    //Megnézzük, hogy van-e ilyen hibaüzenet már megjelenítve
                    if ($.inArray($(this).text(), errorMessages) > -1)
                        contains = true;
                });

                //Hozzáadjuk a hibalistához a mostani hibát
                if (contains == false) {
                    $("ul.errorlist").append("<li data-name='" + inputName + "'>" + errorMessages[i] + "</li>");
                    $("input[name='" + inputName + "']").addClass("error-input");
                }
            }

            //Ha van olyan hiba, amelyet már javítottak, akkor azt levesszük a listáról.
            $("ul.errorlist > li[data-name='" + inputName + "']").each(function () {
                if ($.inArray($(this).text(), errorMessages) == -1) {
                    $(this).remove();
                    $("[name='" + inputName + "']").removeClass("error-input");
                }
            });

        }
        else {
            //Ha volt hibaüzenet az adott mezőhöz, akkor töröljük.
            $("ul.errorlist > li[data-name='" + inputName + "']").each(function () {
                $(this).remove();
                $("[name='" + inputName + "']").removeClass("error-input");
            });

            //Ha nincs már hiba, akkor töröljük a listát.
            if ($("ul.errorlist > li").length == 0)
                $("ul.errorlist").remove();
        }
    }
    else {
        //Ha van megjelenítendő hibaüzenet, akkor létrehozzuk a listát és beleírjuk.
        if (errorMessages.length > 0) {
            var errorlist = "<ul class='errorlist'>";

            for (i = 0; i < errorMessages.length; i++)
                errorlist += "<li data-name='" + inputName + "'>" + errorMessages[i] + "</li>";

            errorlist += "</ul>";
            $("body").append(errorlist);
            $("ul.errorlist").append("<a data-action='close'>X</a>");

            $("[name='" + inputName + "']").addClass('error-input');
        }
    }
}

/*
@param inputName - a mező neve, amely fölé ki kell írni a hibaüzenetet
@param errors - a kiírandó hibaüzenetek
*/

function showErrorAboveField(inputName, errors) {
    var parent = $("[name='" + inputName + "']").parents("li:first");

    if (errors.length > 0) {
        $("[name='" + inputName + "']").addClass("error-input");
        parent.find($(".error-response")).remove();
        for (i = 0; i < errors.length; i++)
            parent.prepend("<span class='error-response'>" + errors[i] + "</span>");
    }
    else {
        $("[name='" + inputName + "']").removeClass("error-input");
        parent.find($(".error-response")).remove();
    }
}

/*
@param property - A mezőnév, amelyben egyedi értéket keresünk
@param value - Az érték, amit a mezőben keresünk
@return Igazzal tér vissza, ha nincs ilyen érték még
*/
function isUnique(property, value, pathToSearch) {
    var returnvalue;
    var data = {};
    data['property'] = property;
    data['value'] = value;
    data['check'] = 1;

    $.ajax({
        url: pathToSearch,
        type: 'POST',
        dataType: 'JSON',
        data: data,
        success: function (response) {
            if (response.status == "success") returnvalue = true;
            else returnvalue = false;
        },
        async: false
    });

    return returnvalue;
}

function checkSelectFields(aboveField) {
    var ret = true;
    $("[data-control='select']").each(function () {
        var value = $(this).find($("select")).val();
        var error = new Array();
        if (value == 0 || value.length == 0) {
            $(this).find($("select")).addClass('error-input');
            var label = $(this).attr('data-label');
            error.push("Kötelező választanod belőle: " + label.toLowerCase());
            if (aboveField === true) showErrorAboveField($(this).attr('data-name'), error);
            else updateErrorList($(this).attr('data-name'), error);
            ret = false;
        }
        else {
            $(this).find($("select")).removeClass('error-input');
            if (aboveField === true) showErrorAboveField($(this).attr('data-name'), error);
            else updateErrorList($(this).attr('data-name'), error);
        }
    });
    return ret;
}

function checkInputFieldsMinLength(aboveField) {
    var ret = true;

    $("[data-control]").each(function () {
        var value = parseInt($(this).attr('data-control'));
        var type = $(this).attr('data-type');

        if (value > 0) {
            if (type == 'textarea') {
                var errors = checkTextareaData($(this).attr('data-label').toString().toLowerCase(), $(this).attr('data-name'), value);
                if (errors.length > 0) ret = false;

                if (aboveField === true) showErrorAboveField($(this).attr('data-name'), errors);
                else updateErrorList($(this).attr('data-name'), errors);
            }
            else {
                var errors = checkInputData($(this).attr('data-label').toString().toLowerCase(), $(this).attr('data-name'), value);
                if (errors.length > 0) ret = false;

                if (aboveField === true) showErrorAboveField($(this).attr('data-name'), errors);
                else updateErrorList($(this).attr('data-name'), errors);
            }
        }
    });

    return ret;
}

$(function () {
    /*A listára való kattintással vagy az x-re való kattintással bezárjuk a hibalistát*/
    $("body").on('click', "ul.errorlist, a[data-action='close']", function () {
        $("ul.errorlist").addClass("hidden");
    });

    $("body").on('click', "ul.successlist, a[data-action='close']", function () {
        $("ul.successlist").addClass("hidden");
    });

    $("body").on('click', "input[type='submit']", function () {
        if ($("ul.errorlist > li").length > 0) $("ul.errorlist").removeClass("hidden");
    });
});


$(document).ready(function () {
    $(function () {
        $('input').focusin(function () {
            $(this).data('holder', $(this).attr('placeholder'));
            $(this).attr('placeholder', '');
        });

        $('input').focusout(function () {
            $(this).attr('placeholder', $(this).data('holder'));
        });
    })
});

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

function setCounters() {
    $("[data-counter]").each(function () {
        var counter = $(this).attr('data-counter');
        var name = $(this).attr('data-name');
        var value = ($(this).attr('data-value')) ? $(this).attr('data-value') : '';

        if ($("span[name='" + name + "']").length == 0) {
            if (value.length > 0) $(this).after("<span name='" + $(this).attr('data-name') + "'>" + Utf8ArrayToStr(value).length + " / " + counter);
            else $(this).after("<span name='" + $(this).attr('data-name') + "'>0 / " + counter);
        }
    });
}

function numberWithPoints(x) {
    x = x.replace(/\./g, '');
    x = x.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return x;
}

function numberWithoutPoints(x) {
    x = x.replace(/\./g, '');
    return (x.length > 0) ? x : "0";
}

$(function () {
    $("[data-counter]").keypress(function (event) {
        var name = $(this).attr('data-name');
        var counter = $(this).attr('data-counter');
        var value = $(this).find($("[name='" + name + "']")).val();
        var length = (event.which >= 0x20) ? value.length + 1 : value.length;
        if (length >= counter && event.which >= 0x20) event.preventDefault();
        $("span[name='" + name + "']").text(length + " / " + counter);
    });

    $("[data-counter]").on('paste', function (event) {
        var input = $(this);
        setTimeout(function () {
            var name = input.attr('data-name');
            var counter = input.attr('data-counter');
            var value = $("[name='" + name + "']").val();
            var length = (event.which >= 0x20) ? value.length + 1 : value.length;
            if (length >= counter) event.preventDefault();
            $("span[name='" + name + "']").text(length + " / " + counter);
        }, 10);
    });

    $("body").on('click', "[data-action='showcheckboxcontainer']", function () {
        $("[data-name='checkboxcontainer']").toggleClass('hidden');
    });

    $("body").on('keyup', "[data-numberwithpoints='true'] input", function (event) {
        $(this).val(numberWithPoints($(this).val()));
    });

    //Ha a labelre kattintanak, kapjon focust a beviteli mező
    $('body').on('click', 'label', function () {
        $(this).siblings(':input').focus();
    });

    $('body').on('focus', ':input', function () {
        $(this).parents('li:first').addClass('focus-input');
    });

    $("body").on('blur', ':input', function(){
        $(this).parents('li:first').removeClass('focus-input');
    });
});
