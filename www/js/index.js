var app = {
 
    // Application Constructor
    initialize: function() {
        this.setup_constants();
        this.bindEvents();
    },

    setup_constants: function() {
        app.site_url = "https://app.skattogfradrag.no/wp-admin/admin-ajax.php";
        // app.site_url = "https://devtemp.no/skattogfradrag-new/wp-admin/admin-ajax.php";
        app.log_in = jQuery('#send_data');
        app.log_out = jQuery('.log_out');
        app.capture_photo = jQuery('.accessCamera');
        app.select_photo = jQuery('.accessLibrary');
        app.user_year = jQuery("#user_year");
        app.lol = "";
        app.imageDataLibrary = "";
        app.uploadPhotoOptions = true;
        app.checkToBack = 'home';
        app.uploadedFilesData = "";
        // messages
        app.noCorrectVal = 'Verdi ble IKKE oppdatert pga. feil i nummerformat. Prøv igjen med nummerformat: 1000.00';
        app.noInternetConnection = 'Koble til internett og forsøk igjen.';
        app.messageText = 'Beskjed';
        app.OKText = 'OK';
        app.requiredEmailLogin = 'Oppgi brukernavn eller e-post.';
        app.requiredPassword = 'Oppgi passord.';
        app.loadingText = 'Laster';
        app.uploadingText = 'Laster opp';
        app.wrongCredintials = 'Feil brukernavn eller passord.';
        app.errorWithCode = 'En feil har oppstått – Feilkode: ';
        app.contactUserEmail = 'Oppgi din e-postadresse.';
        app.notValidEmail = 'Du må oppgi en gyldig e-postadresse.';
        app.contactMessage = 'Skriv din beskjed.';
        app.needSaveForm = 'Ønsker du å lagre endringene?';
        app.yesText = 'Ja';
        app.noText = 'Nei';
    },

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        var user_id = window.localStorage.getItem("user_id");

        if (!user_id) 
            app.renderSignInView();
        else
            app.renderHomeView();

        document.addEventListener('deviceready', this.onDeviceReady, false);
        app.ddpp();
    },

    onDeviceReady: function() {

        app.receivedEvent('deviceready');
 
    },

    checkConnection: function() {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        if ((states[networkState]) == states[Connection.NONE]) {
            return false;
        } else 
            return true;
    },

    onNoEnternetMessage: function() {
        navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
    },
    contactUsModal: function() {
        $('#contact-modal .modal-body form.btl-formcontact').remove();
        var htmlModal = "<form name='btl-formcontact' class='btl-formcontact' method='post'>" +
                                    "<p>Din e-post: <span><input name='user_email' type='email' class='user_email'></span></p>" +
                                    "<p>Beskjed:</p><textarea name='author_message' cols='30' rows='6'></textarea>" +
                                    "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'><input type='hidden' name='action' value='kontact_message'><input type='button' class='submit_request' value='Send beskjed'>" +
                                "</form>";
        var script = "<script>jQuery('.submit_request').on('click', app.contactUs);</script>"
        $('#contact-modal .modal-body').append(htmlModal);
        $('body').append(script);
        $('#contact-modal').modal('show');
    },
    userForgotModal: function() {
        $('#contact-modal .modal-body form.btl-formcontact').remove();
        var htmlModal = "<form name='btl-formcontact' class='btl-formcontact' method='post'>" +
                                    "<p class='forgot-user-email-title'>Oppgi registrert e-post</p>" +
                                    "<p class='forgot-user-email-input'>E-post: <span><input name='user_email' type='email' class='user_email'></span></p>" +
                                    "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'><input type='hidden' name='action' value='user_pass_forget'><input type='button' id='forgot' value='Send beskjed'>" +
                                "</form>";
        var script = "<script>jQuery('#forgot').on('click', app.userForgot);</script>"
        $('#contact-modal .modal-body').append(htmlModal);
        $('body').append(script);

        $('#contact-modal').modal('show');                                
        
    },
    userForgot: function() {
        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        var email = $('form[name=btl-formcontact]').find('input[name=user_email]').val();
        

        if (email == "") {
            navigator.notification.alert(app.contactUserEmail, null, app.messageText, app.OKText);
            return false;
        }

        if (!/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            navigator.notification.alert(app.notValidEmail, null, app.messageText, app.OKText);
            return false;
        }
        var xhr = new XMLHttpRequest();
            xhr.open("GET", app.site_url + "?action=user_pass_forget&username=" + encodeURIComponent(email));
            xhr.onload = function(){
                var response = xhr.responseText;
                
                if(response.errors) {
                    $('.container_loader').remove();
                    navigator.notification.alert(app.wrongCredintials, null, app.messageText, app.OKText);
                }
                else
                {
                    $('#contact-modal').modal('hide');
                    navigator.notification.alert(response, null, app.messageText, app.OKText);
                    

                    // window.localStorage.setItem("user_id", response);
                    // window.localStorage.setItem("user_year", new Date().getFullYear() );
                    // app.renderHomeView();
                }
            }   
        xhr.send();
    },
    userLogin: function() {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var typeLogin = "mobType";
        if(username == "") {
            navigator.notification.alert(app.requiredEmailLogin, null, app.messageText, app.OKText);
            return;
        }

        if(password == "") {
            navigator.notification.alert(app.requiredPassword, null, app.messageText, app.OKText);  
            return;
        }

        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');

        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=user_login&username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&type_login=" + encodeURIComponent(typeLogin));
        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);
            
            if(response.errors) {
                $('.container_loader').remove();
                navigator.notification.alert(app.wrongCredintials, null, app.messageText, app.OKText);
            } else {
                var response = jQuery.parseJSON(xhr.responseText);
                window.localStorage.setItem("user_id", response);
                window.localStorage.setItem("plan_type", "global_plan");
                window.localStorage.setItem("travel_id", "0");
                
                window.localStorage.setItem("user_year", new Date().getFullYear() );
                app.renderHomeView();
            }
        }   
        xhr.send();
    },

    userLogout: function() {
        window.localStorage.removeItem("user_id");
        window.localStorage.removeItem("user_year");
        window.localStorage.removeItem("travel_id");
        app.renderSignInView();
    },
    contactUs: function() {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        var email = $('form[name=btl-formcontact]').find('input[name=user_email]').val();
        var message = $('form[name=btl-formcontact]').find('textarea').val();

        if (email == "") {
            navigator.notification.alert(app.contactUserEmail, null, app.messageText, app.OKText);
            return false;
        }

        if (!/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            navigator.notification.alert(app.notValidEmail, null, app.messageText, app.OKText);
            return false;
        }

        if (message == "") {
            navigator.notification.alert(app.contactMessage, null, app.messageText, app.OKText);  
            return false;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=kontact_message&user_email=" + encodeURIComponent(email) + "&author_message=" + encodeURIComponent(message));
        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);

            if (response.status == '404') 
                navigator.notification.alert(response.message, null, app.messageText, app.OKText);
            else {
                $('form[name=btl-formcontact]').find('input[name=user_email]').val('');
                $('form[name=btl-formcontact]').find('textarea').val('');
                $('#contact-modal').modal('hide');
                navigator.notification.alert(response.message, null, app.messageText, app.OKText);
            }

        }   
        xhr.send();

    },
    capturePhoto: function() {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }
        
 
         navigator.camera.getPicture(app.onPhotoDataLibrarySuccess, app.onFail, { 
            quality: 25,
            destinationType: Camera.DestinationType.FILE_URI
        });
    },

    openLibrary: function() {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        navigator.camera.getPicture(app.onPhotoDataLibrarySuccess, app.onFail, { 
            quality: 25,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        });
    },
    selectPopupPhoto: function () {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        var user_year = window.localStorage.getItem("user_year");
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;
        var user_id = window.localStorage.getItem("user_id");

        window.localStorage.setItem("user_year_loc", user_year);

        

        var sel_html = app.yearList();
        var html_options = '';
        var planVariation = '';
        var planType = false;
        var planMore = false;
        var ifInputAmpty = '';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=get_user_plan&user_id=" + encodeURIComponent(user_id) + "&user_year=" + encodeURIComponent(user_year));
        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);

            if (response.status == '404') {
                $('.container_loader').remove();
                navigator.notification.alert(response.message, null, app.messageText, app.OKText);
            }else if (response.status == '200') {
                $.each(response.message, function(el, list_options) {

                    html_options += '<div class="section_salgsinntekter first-sum"><div class="title">'+ el +'</div>';
                    html_options += '<div class="scoll_section">';

                    $.each(list_options, function(option_key, option_values) {
                    
                       
                        html_options += '<div class="line"><span class="'+ option_key +'">'+ option_key +'</span><span data-r="left" class="'+ option_key +'_text">'+ option_values.label +'</span></div>';
                    });
                        html_options += '</div></div>';
                    
                });
            }

        }

        xhr.send();
      
    },
    onPhotoDataSuccess: function(imageData) {

        $('#calculate_modal').modal('show');
        // app.lol = imageData;
        // app.uploadPhotoOptions = true;
        app.lol = imageData;
        app.uploadPhotoOptions = true;
        // app.uploadImage(imageData);

    },
    addNewTravelModal: function() {
        $('#add-new-travel-modal').modal('show');

    },
    onPhotoDataLibrarySuccess: function(imageData) {

        $('#calculate_modal').modal('show');
        console.log(imageData);
        app.imageDataLibrary = imageData;
        app.uploadPhotoOptions = false;
        // app.uploadImage(imageData);

    },



    // Save image and number for plan btn
    llld: function() {
        if ($("#myselect option:selected").val() == "pls-select") {
            $('#pls-select-text').show();
        } else if ($('.input_upload_numbers').val() == "") {
            $('.modal-window-error-input').show();
        } else {
            var name =$("#myselect option:selected").text();
            var idName = $('select[name="carlist"]').val();
            var amountPlan = $('.input_upload_numbers').val();
            var description = $(this).closest('div').find('textarea').val();
            var userPlanType = window.localStorage.getItem("plan_type");
            if ($('#user_travel_id').length != 0) {
                var userTravelId = $('#user_travel_id').val();
            } else {
                var userTravelId = 0;
            }
            
            console.log(userPlanType);
            console.log(userTravelId);
            console.log(name);
            console.log(idName);

            amountPlan = amountPlan.toString().replace(',', '.');
            $('#calculate_modal').modal('hide');

            if (app.uploadPhotoOptions) {
                app.uploadImage(app.lol, name, idName, amountPlan, description, userPlanType, userTravelId);
            } else {
                app.onPhotoDataSuccessLibrary(app.imageDataLibrary, name, idName, amountPlan, description, userPlanType, userTravelId)
            }          
        }
    },


    onPhotoDataSuccessLibrary: function(imageData, curVal, idName, amountPlan, description, userPlanType, userTravelId) {

        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.uploadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');

        var win = function (result) {
            $('.container_loader').remove();
            navigator.notification.alert(result.response, null, app.messageText, app.OKText);
        }
     
        var fail = function (error) {
            $('.container_loader').remove();
            navigator.notification.alert(app.errorWithCode + error.response, null, app.messageText, app.OKText);
        }

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
        options.mimeType = "image/png";
        options.params = {
            user_year: window.localStorage.getItem("user_year"),
            user_id: window.localStorage.getItem("user_id"),
            cur_val: curVal,
            cur_id: idName,
            user_travel_id: userTravelId,
            user_plan_type: userPlanType,
            amount_number: amountPlan,
            user_description: description,
        };
        options.chunkedMode = false;
      
        var ft = new FileTransfer();
        ft.upload(imageData, encodeURI( app.site_url + "?action=upload_img_library" ), win, fail, options);

    },

    onFail: function(message) {

        navigator.notification.alert(message, null, app.messageText, app.OKText);
 
    },

    uploadImage: function(imageData, curVal, idName, amountPlan, description, userPlanType, userTravelId) {
        
        var user_id = window.localStorage.getItem("user_id");
        var user_year = window.localStorage.getItem("user_year");

        $.ajax({
            type: "POST",
            url: app.site_url,
            data: {
                img_data:imageData,
                cur_val:curVal,
                cur_id:idName,
                action:'upload_image',
                user_id:user_id,
                user_year:user_year,
                amount_number: amountPlan,
                user_description: description,
                user_travel_id: userTravelId,
                user_plan_type: userPlanType,
            },
            cache: false,
            contentType: "application/x-www-form-urlencoded",
            success: function (result) {
                $('.container_loader').remove();
                navigator.notification.alert(result, null, app.messageText, app.OKText);
            }
        });
    },

    changeUserYear: function() {
        window.localStorage.setItem("user_year", this.value);
    },
    changeUserPlanType: function() {
        window.localStorage.setItem("plan_type", this.value);
    },
    changeTravelIdFilesPage: function() {
        let travelId = $(this).val();
        // jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');
        window.localStorage.setItem("travel_id", travelId);
        app.getUploadedInfo();
        // $('.container_loader').remove(); 
        // console.log(travelId);
    },
    changeTravelId: function() {
        let travelId = $(this).val();
        window.localStorage.setItem("travel_id", travelId);
        app.renderPlanView();
        console.log(travelId);
    },
    changeUserYearUploadedPage: function() {
        window.localStorage.setItem("user_year", this.value);
        app.getUploadedInfo();
    },

    changeUserYearData: function() {

        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }

        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');

        var user_id = window.localStorage.getItem("user_id");
        var user_year = $('#user_year').val();

        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=admin_change_user_year&user_id=" + encodeURIComponent(user_id) + "&year=" + encodeURIComponent(user_year));
        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);

            $.each(response, function(ind, value) {
                $('.' + ind + '_value').val(value);
            });
            var testWithYear = $('.section-after-sum-fields .text-with-year');
            $.each(testWithYear, function (item, val) {
                testWithYearItem = $(val).text();
                $(val).html('');
                testWithYearItem = testWithYearItem.substring(0, testWithYearItem.length - 4);
                $(val).html(testWithYearItem+user_year);
            });
            
            $('.total_result .result_year').text(user_year);

            window.localStorage.setItem("user_year_loc", user_year);

            // if(!$('.document').hasClass('more-text-fields')) {
                app.calculateFields();
            // }

            $('.container_loader').remove();
            app.checkInputs();
        } 

        xhr.send();

    },

    planTypeList: function() {
        var user_plan_type = window.localStorage.getItem("plan_type");
        var type_sel_html = '';
        if (user_plan_type == "global_plan") {
            type_sel_html += '<option value="global_plan" selected="selected">Bilagsføring</option>';
            type_sel_html += '<option value="traveling-plan">Reiseregning</option>';
        } else {
            type_sel_html += '<option value="global_plan">Bilagsføring</option>';
            type_sel_html += '<option value="traveling-plan" selected="selected">Reiseregning</option>';
        }
        
        return type_sel_html;
    },

    yearList: function() {

        var user_year = window.localStorage.getItem("user_year");
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;

        var currentYear = new Date().getFullYear();
        var sel_html = '';

        for (i = currentYear; i > (currentYear - 5); i--) {
            if (user_year == i) 
                sel_html += '<option value="' + i + '" selected="selected">' + i + '</option>';
            else 
                sel_html += '<option value="' + i + '">' + i + '</option>';
        }

        return sel_html;
    },



    calculateFields: function() {
        if ($('.document').hasClass('more-text-fields')) {

            var inputs_m = $('.section_kostnader input');
            var total_a = total_m = total_profit = 0;

            $.each(inputs_m, function(ind, el) {
                var val = ($(el).val() == '') ? 0 : $(el).val();
                // val = val.toString();
                // val = val.replace(',', '.');
                total_m += Number(val);
            });
            total_m = total_m.toFixed(2);
            total_m = app.numberWithCommas(total_m);
            $('.total_kostnader .value').text(total_m);

        } else {
            var inputs_a = $('.section_salgsinntekter input');
            var inputs_m = $('.section_kostnader input');
            var inputs_current_m = $('.section_kostnader');
            var total_a = total_m = total_profit = 0;
            var total_m_array = [];


            $.each(inputs_a, function(ind, el) {
                var val = ($(el).val() == '') ? 0 : $(el).val();
                // val = val.toString();
                // val = val.replace(',', '.');
                total_a += Number(val);
            });
            if ($('.document').hasClass('more-konstander')) {
                $(inputs_current_m).each( function(){
                    var currentBlock = $(this).find('input');
                    var currentTotalM = 0;
                        $(currentBlock).each( function(){
                            var val = ($(this).val() == '') ? 0 : $(this).val();
                            // val = val.toString();
                            // val = val.replace(',', '.');
                            currentTotalM += Number(val);
                        });
                    total_m_array.push(currentTotalM);
                });
            } else {
                
            }
            $.each(inputs_m, function(ind, el) {
                var val = ($(el).val() == '') ? 0 : $(el).val();
                total_m += Number(val);
            });

            total_a = total_a.toFixed(2);
            total_m = total_m.toFixed(2);

            // total_a = total_a.toString().replace(',', '.');
            // total_m = total_m.toString().replace(',', '.');

            total_profit = total_a - total_m;

            total_profit = total_profit.toFixed(2);
            total_a = app.numberWithCommas(total_a);
            total_m = app.numberWithCommas(total_m);
            total_profit = app.numberWithCommas(total_profit);
            if ($('.document').hasClass('more-konstander')) {
                $('.section_salgsinntekter.first-sum .current-total-value').text(total_a);
                for (var i = 0; i < total_m_array.length; i++) {
                    var a = $('.current-total-value')[i+1];
                    $(a).text(app.numberWithCommas(total_m_array[i]));
                }
            } else {
                $('.total_value').text(total_a);        
            }

            $('.total_kostnader .value').text(total_m);
            $('.total_result .value').text(total_profit);
        }
        

    },

    calculateString: function() {
        var name = $(this).closest('div').find('input[name=formula_area]').attr('class');
        var str = '';
        var needWindow = false;
        //var str = $(this).val();
        if ($(this).closest('div').find('input[name=formula_area]').data('re') == 'plus') {
            if($(this).closest('div').find('input[name=formula_area]').val() == '') {
                str = $('input[name='+ name +']').val();
                needWindow = true;
            } else {

                str = $('input[name='+ name +']').val()+'+'+$(this).closest('div').find('input[name=formula_area]').val();
            }

        } else if ($(this).closest('div').find('input[name=formula_area]').data('re') == 'minus') {
            if($(this).closest('div').find('input[name=formula_area]').val() == '') {
                str = $('input[name='+ name +']').val();
                needWindow = true;
            } else {
                
                str = $('input[name='+ name +']').val()+'-'+$(this).closest('div').find('input[name=formula_area]').val();
            }
            
            
        } else {
            if($(this).closest('div').find('input[name=formula_area]').val() == '') {
                str = '';
            } else {
                
                str = $(this).closest('div').find('input[name=formula_area]').val();
            }
            
        }
        if(str != '') {
            var resultStr = str.replace(',', '.');
            var result = new Function('return ' + resultStr)();

            result = result.toFixed(2);
            $('input[name='+ name +']').val(result);
        } else {
            var result = '';
            $('input[name='+ name +']').val(result);
            needWindow = true;
        }
        // result = result.replace('.', ',');
        
        var ee = $('span');

        $('span.span-calc-'+ name).each( function(){
            $(this).data('value-span', result);
        });
        // $('span.span-calc-'+ name).data('value-span', result);
        //app.calculateFields();
        app.checkInputs();
        if($('.line input').val() != '') {

        }
        
        $('#calculate_modal').modal('hide');
        if (needWindow) {
            app.noCorectVal();
        }
        window.localStorage.setItem("need_save", '1');

    },

    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    saveOptions: function() {

        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');

        var user_id = window.localStorage.getItem("user_id");
        var prev_year = window.localStorage.getItem("user_year_loc");
        var travelId = window.localStorage.getItem("travel_id");
        var year = (prev_year) ? prev_year : $('#user_year').val();
        var data = $('#save_user_options_value').serialize();
        if (prev_year) $('#user_year').val(prev_year).prop('selected', true);

        data += '&user_id=' + user_id+'&page_type=traveling_plan&travel_id='+travelId + '&year=' + year + '&action=desc_save_user_options_value';
        // data += '&user_id=' + user_id + '&year=' + year + '&action=save_user_options_value';

        $.ajax({
            type: "GET",
            url: app.site_url,
            data: data,
            success: function (result) {
                window.localStorage.removeItem("need_save");
                $('.container_loader').remove();
                navigator.notification.alert(result, null, app.messageText, app.OKText);
                // if(!$('.document').hasClass('more-text-fields')) {
                    app.renderPlanView();
                // }
                
            }
        });

        $('.container_loader').remove();

    },
    createNewTravel: function() {

        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');
        $('#add-new-travel-modal').modal('hide');
        var user_id = window.localStorage.getItem("user_id");
        var prev_year = window.localStorage.getItem("user_year_loc");
        var newTravelTitle = $('.new-travel-title-field').val();
        var year = (prev_year) ? prev_year : $('#user_year').val();
        if (prev_year) $('#user_year').val(prev_year).prop('selected', true);

        $.ajax({
            type: "POST",
            url: app.site_url,
            data: {
                action: 'create_new_traveling',
                user_year: prev_year,
                user_id: user_id,
                new_tavel_title: newTravelTitle,
            },
            success: function (result) {

                window.localStorage.removeItem("need_save");
                $('.container_loader').remove();
                var response = $.parseJSON(result);
                window.localStorage.setItem("travel_id", response.user_global_fields_count);
                app.renderPlanView();

                // navigator.notification.alert(result, null, app.messageText, app.OKText);
                // if(!$('.document').hasClass('more-text-fields')) {
                    // app.calculateFields();
                // }
                
            }
        });

        $('.container_loader').remove();
        
    },
    checkNeedToSavePerson: function() {

        var need_save = window.localStorage.getItem("need_save");

        if ( ! need_save )
            app.renderPersonView();
        else if ( need_save )
            navigator.notification.confirm(
                app.needSaveForm,
                app.onConfirmAlert,
                app.messageText,
                [app.yesText,app.noText]
            );
    },
    checkNeedToSave: function() {

        var need_save = window.localStorage.getItem("need_save");

        if ( ! need_save )
            app.renderHomeView();
        else if ( need_save )
            navigator.notification.confirm(
                app.needSaveForm,
                app.onConfirmAlert,
                app.messageText,
                [app.yesText,app.noText]
            );
    },
    noCorectVal: function() {
        navigator.notification.alert(app.noCorrectVal, null, app.messageText, app.OKText);
    },

    checkNeedToSaveLogout: function() {

        var need_save = window.localStorage.getItem("need_save");

        if ( ! need_save )
            app.userLogout();
        else if ( need_save )
            navigator.notification.confirm(
                app.needSaveForm,
                app.onConfirmLogout,
                app.messageText,
                [app.yesText,app.noText]
            );
    },

    checkNeedToSaveYear: function() {

        var need_save = window.localStorage.getItem("need_save");

        if ( ! need_save )
            app.changeUserYearData();
        else if ( need_save ) {
            navigator.notification.confirm(
                app.needSaveForm,
                app.onConfirmYear,
                app.messageText,
                [app.yesText,app.noText]
            );
        }
    },

    onConfirmAlert: function(buttonIndex) {

        window.localStorage.removeItem("need_save");

        if (buttonIndex == 1)
            app.saveOptions();
        else
            app.renderHomeView();
    },

    onConfirmLogout: function(buttonIndex) {

        window.localStorage.removeItem("need_save");

        if (buttonIndex == 1)
            app.saveOptions();
        else
            app.userLogout();
    },

    onConfirmYear: function(buttonIndex) {

        window.localStorage.removeItem("need_save");

        if (buttonIndex == 1)
            app.saveOptions();
        else
            app.changeUserYearData();
        
    },

    showCalculateModal: function() {
        var inputVal = $(this).closest('div').find('.input-calc-numbers').val() == '' ? '0' : $(this).closest('div').find('.input-calc-numbers').val();

        var modalTitle = 'Nåværende sum: '+inputVal;
        var modalSubTitle = 'Legg inn tall:';
        $('#calculate_modal .modal-window-title').text(modalTitle);
        $('#calculate_modal .modal-window-sub-title').text(modalSubTitle);
        $('#calculate_modal').modal('show');
        $('input[name=formula_area]').data('re', '')
        $('input[name=formula_area]').val($(this).val()).attr('class', $(this).attr('name'));        

        // $('textarea[name=formula_area]').data('re', '')
        // $('textarea[name=formula_area]').val($(this).val()).attr('class', $(this).attr('name'));

    },
    showMinusCalculateModal: function() {
        var inputVal = $(this).closest('div').find('.input-calc-numbers').val() == '' ? '0' : $(this).closest('div').find('.input-calc-numbers').val();
        var modalTitle = 'Nåværende sum: '+inputVal;
        var modalSubTitle = 'Legg til tallet du vil trekke fra nåværende sum.';
        $('#calculate_modal .modal-window-title').text(modalTitle);
        $('#calculate_modal .modal-window-sub-title').text(modalSubTitle);

        $('#calculate_modal').modal('show');
        $('input[name=formula_area]').val('').attr('class', $(this).data('name')).attr('data-input-value', $(this).data('value-span')+'+').data('re', 'minus');

        // $('textarea[name=formula_area]').val('').attr('class', $(this).data('name')).attr('data-input-value', $(this).data('value-span')+'+').data('re', 'minus');
    },
    showPlusCalculateModal: function() {
        var inputVal = $(this).closest('div').find('.input-calc-numbers').val() == '' ? '0' : $(this).closest('div').find('.input-calc-numbers').val();
        var modalTitle = 'Nåværende sum: '+inputVal;
        var modalSubTitle = 'Legg til tallet du vil legge til på nåværende sum';
        $('#calculate_modal .modal-window-title').text(modalTitle);
        $('#calculate_modal .modal-window-sub-title').text(modalSubTitle);
        $('#calculate_modal ').modal('show');
        $('input[name=formula_area]').val('').attr('class', $(this).data('name')).attr('data-input-value', $(this).data('value-span')+'+').data('re', 'plus');

        // $('textarea[name=formula_area]').val('').attr('class', $(this).data('name')).attr('data-input-value', $(this).data('value-span')+'+').data('re', 'plus');
    },
    checkValue: function(e) {

        if (!$(this).hasClass('no-check')){
            this.value = this.value.replace(/[a-zA-Zа-яА-Яa-åA-Å\,\'!@#$%^&*=_~`<>|\\/]/, '');  
        }

    },
    cookieOkFunction: function() {
        window.localStorage.setItem("cookie_ok", "ok");
        $('#cookie-alert').remove();
    },
    checkToBackfunc: function() {
        if (app.checkToBack == 'login') {
            app.renderSignInView();
        } else {
            app.renderHomeView();
        }
    },
    renderSignInView: function() {
        app.checkToBack = 'login';
        var cookie_check = window.localStorage.getItem("cookie_ok");
        if (cookie_check != 'ok') {
            var cookie_alert = "<div id='cookie-alert' class='cookie-notice-container'><span>Vi bruker informasjonskapsler for å gi deg en bedre brukeropplevelse. Les mer om vår personvernhåndtering </span><span class='person-btn'>her</span><span class='btn-cookie-ok'>Forstått</span></div>";
        } else {
            var cookie_alert = "";
        }
        var html =
                "<div class='logo'><img src='img/logo1.png' alt='Logo'></div>" +cookie_alert+
                "<div class='app_text_title'><p>Skatt & Fradrag</p><p>Innrapportering til regnskap</p></div>" +
                "<div id='login_section'><p>Brukernavn</p><input type='text' id='username' name='login'><p>Password</p><input type='password' id='password' name='password' autocomplete='off'><button id='send_data'>Logg inn</button></div>" +
                "<div class='footer_contact'><p>Har du ikke konto? <span class='modal_contact'>Ta kontakt</span></p>" +
                "<p class='forgot-no-marg'><span class='forgot-modal'>Glemt passordet?</span></p></div>"+
                "<div class='modal custom fade in' id='contact-modal' aria-hidden='false' aria-labelledby='contact-modal-label' role='dialog' tabindex='-1'>" +
                    "<div class='modal-dialog'>" +
                        "<div class='modal-content'>" +
                            "<div class='modal-body'>" + 
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
                "<script>jQuery('.btn-cookie-ok').on('click', app.cookieOkFunction);jQuery('.person-btn').on('click', app.checkNeedToSavePerson);jQuery('.forgot-modal').on('click', app.userForgotModal);jQuery('#send_data').on('click', app.userLogin);jQuery('.modal_contact').on('click', app.contactUsModal);</script>";

        $('body').attr('class', 'main').html(html);
    },

    renderHomeView: function() {
        // window.localStorage.removeItem("cookie_ok");
        app.checkToBack = 'home';
        var cookie_check = window.localStorage.getItem("cookie_ok");
        if (cookie_check != 'ok') {
            var cookie_alert = "<div id='cookie-alert' class='cookie-notice-container'><span>Vi bruker informasjonskapsler for å gi deg en bedre brukeropplevelse. Les mer om vår personvernhåndtering </span><span class='person-btn'>her</span><span class='btn-cookie-ok'>Forstått</span></div>";
        } else {
            var cookie_alert = "";
        }
        var sel_html = app.yearList();
        var plan_sel_html = app.planTypeList();
        var html =
                "<div class='select_files_page'><p>Opplastede filer</p></div>" +
                "<div class='select_plan_type'><select name='user_plan_type' id='user_plan_type'>" + plan_sel_html + "</select></div>" +
                "<div class='log_out'>Logg ut</div>" +cookie_alert+
                "<div class='select_year'><p class='title'>Velg år</p><div class='year-block-app'><select name='select_year' id='user_year'>" + sel_html + "</select></div></div>" +
                "<div class='camera_options capture_photo'><div class='img_camera'><img src='img/camera_img.png' alt='Camera'></div><p>SEND INN KVITTERINGER</p></div>" +
                "<div class='camera_options select_photo'><div class='img_camera'><img src='img/settings_img.png' alt='Plus'></div><p>REGISTRERTE POSTER</p></div>" +
                
                
                "<script>jQuery('.btn-cookie-ok').on('click', app.cookieOkFunction);jQuery('.person-btn').on('click', app.checkNeedToSavePerson);jQuery('#user_year').on('change', app.changeUserYear);"+
                "jQuery('.log_out').on('click', app.userLogout);jQuery('.capture_photo').on('click',app.renderCameraView);jQuery('.select_photo').on('click', app.renderPlanView);"+
                "jQuery('.select_files_page').on('click', app.getUploadedInfo);jQuery('#user_plan_type').on('change', app.changeUserPlanType);</script>";

        $('body').attr('class', 'home').html(html);
    },
    sortFilesFunc: function(fileElement) {
        return fileElement.plan_field_id == this;
    },    
    renderUploadedFilesView: function() {
        app.checkToBack = 'home';
        var filesHtml = '';
        var traveling_select_html = '';
        var resultKontander = 0;
        var resultSalgsinntekter = 0;
        var resultAmount = 0;
        var cookie_check = window.localStorage.getItem("cookie_ok");
        var planType = window.localStorage.getItem("plan_type");
        var travelId = window.localStorage.getItem("travel_id");
        if (cookie_check != 'ok') {
            var cookie_alert = "<div id='cookie-alert' class='cookie-notice-container'><span>Vi bruker informasjonskapsler for å gi deg en bedre brukeropplevelse. Les mer om vår personvernhåndtering </span><span class='person-btn'>her</span><span class='btn-cookie-ok'>Forstått</span></div>";
        } else {
            var cookie_alert = "";
        }
        var sel_html = app.yearList();
        var files_year = window.localStorage.getItem("user_year"); 
        if (planType == "traveling-plan" ) {
            var data = app.uploadedFilesData.user_global_fields[planType].travelings[0];
            var metaData = app.uploadedFilesData.user_meta[planType].travelings[travelId];
            traveling_select_html += '<p>Reiseregning</p><select class="traveling-id-select" name="select-travel-id" value="">';
            $.each(app.uploadedFilesData.user_meta[planType].travelings, function(index,el) {
                let ifSelected = '';
                if (travelId == index) {
                    ifSelected = ' selected="selected"';
                }
                traveling_select_html += '<option value="'+index+'"'+ifSelected+'>'+el['Personal-info']['117']+'</option>';
            });
            traveling_select_html += '</select>';
            console.log(metaData);
        } else {
            var data = app.uploadedFilesData.user_global_fields[planType];
            var metaData = app.uploadedFilesData.user_meta[planType];
            traveling_select_html += '<p>Bilagsføring</p>';
        }
        
        $.each(data, function(index, value){
            if (index == "Personal-info" || index == "sel-file" || index == "label" || index == "plan-variation") {
                return;
            } else {
                 filesHtml += '<div class="plan-files-block" data-plan-name="'+index+'"><p class="plan-titles">'+index+'</p>';
            }
            $.each(value, function(elId, val) {
                console.log(val);

                var fieldFiles = app.uploadedFilesData.file_data.filter(app.sortFilesFunc, elId);
                console.log(fieldFiles);
                if (planType == "traveling-plan" && fieldFiles.length  != 0) {
                    console.log(parseFloat(metaData[index][elId.toString()]));
                    resultAmount = parseFloat(resultAmount) + parseFloat(metaData[index][elId.toString()]); 
                } else if(planType == "global_plan" && fieldFiles.length  != 0 && index == "salgsinntekter" && metaData[index][elId.toString()] != "") {
                    resultSalgsinntekter = parseFloat(resultSalgsinntekter) + parseFloat(metaData[index][elId.toString()]); 
                } else if(planType == "global_plan" && fieldFiles.length  != 0 && index != "salgsinntekter" && metaData[index][elId.toString()] != "") {
                    resultKontander = parseFloat(resultKontander) + parseFloat(metaData[index][elId.toString()]); 
                } else if(planType == "global_plan" && elId == '7140' && metaData[index][elId.toString()] != "") {
                    resultKontander = parseFloat(resultKontander) + parseFloat(metaData[index][elId.toString()]);
                }
                if (elId == '7140') {
                    filesHtml += '<div class="plan-files-block" data-plan-name="'+elId+'"><p>'+val+'<span> (Total:'+metaData[index][elId.toString()]+')</span></p></div>';
                }
                if (fieldFiles.length  != 0) {
                    filesHtml += '<div class="plan-files-block" data-plan-name="'+elId+'"><p>'+val+'<span> (Total:'+metaData[index][elId.toString()]+')</span></p>';
                    $.each(fieldFiles, function(i,v){
                        filesHtml += '<div class="cur-link-container">';

                        filesHtml += '<div class="link-box"><span data-file-name="https://app.skattogfradrag.no/wp-content/uploads/'+v.file_path+'" class="link-to-uploaded-file"'+
                        ' target="_blanck">'+v.file_name+'<span style="text-decoration: underline; display:block;">Number: '+v.file_number+'</span></span><span class="del-btn-box del-uploaded-file" data-del-file-name="'+v.file_name+'" data-db-file-id="'+v.id+'"><span>X</span></span><div class="clear"></div></div>';
                        filesHtml += '<div class="file-desc">'+v.file_html_text+'</div>';
                        filesHtml += '</div>';
                    });
                    filesHtml += '</div>';
                }
                
            });
            filesHtml += '</div>';

        });
        if (planType == "global_plan") {
            resultAmount = parseFloat(resultSalgsinntekter) - parseFloat(resultKontander); 
        }
        var html = '<div class="return_back"><img src="img/close.png" alt="Return"></div>' +
                "<div class='log_out'>Logg ut</div>" +cookie_alert+
                "<div class='select_year'><p class='title'>Velg år</p><select name='select_year' id='user_year'>" + sel_html + "</select></div>" +
                "<div class='plan-files-container'><p class='uploaded-files-page-title'>Opplastede filer og beskrivelser</p><div class='files-page-type-block'>"+traveling_select_html+"</div>"+filesHtml+
                "<div class='total_result'>Resultat <span class='result_year'>"+ files_year +"</span>:  <span class='value'>"+resultAmount.toFixed(2)+"</span> <span>kr</span></div></div>"+
                "<div class='modal custom fade in' id='show-file-modal' aria-hidden='false' aria-labelledby='contact-modal-label' role='dialog' tabindex='-1'>" +
                    "<div class='modal-dialog'>" +
                        "<div class='modal-content'>" +
                            "<div class='modal-body'>" +
                            "<img src=''>"+
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
                "<div class='modal custom fade in' id='show-delete-file-modal' aria-hidden='false' aria-labelledby='contact-modal-label' role='dialog' tabindex='-1'>" +
                    "<div class='modal-dialog'>" +
                        "<div class='modal-content'>" +
                            "<div class='modal-body'>" +
                            "<div class='btl-formcontact'>"+
                                "<p class='modal-window-title upload-title'>Er du sikker på at du vil slette file med tilhørende beskrivelse?</p>"+
                                "<input type='button' class='del-file-ok' data-del-file-name='' data-user-folder='' data-db-file-id='' data-file-plan='' value='Ok'>"+
                                "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'>"+
                            "</div>"+
                            "</div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
               "<script>jQuery('.select_files_page').on('click', app.getUploadedInfo);jQuery('.link-to-uploaded-file').on('click', app.showUploadedImage);"+
               "jQuery('.return_back').on('click',app.renderHomeView);jQuery('#user_year').on('change', app.changeUserYearUploadedPage);jQuery('.traveling-id-select').on('change', app.changeTravelIdFilesPage);"+
               "jQuery('.del-uploaded-file').on('click',app.deleteUplodedFile);jQuery('.del-file-ok').on('click',app.delUploadedFiles);</script>";
                
        $('body').attr('class', 'uploaded-files-page').html(html);

    },
    showUploadedImage: function() {
        $('#show-file-modal .modal-body img').attr('src', $(this).data('file-name'));
        $('#show-file-modal').modal('show');
    },
    deleteUplodedFile: function() {
        var fileName = $(this).data('del-file-name');
        var dbFileId = $(this).data('db-file-id');
        var filePlan = $(this).parents('.plan-files-block').data('plan-name');

        $('#show-delete-file-modal .del-file-ok').data('del-file-name', fileName);
        $('#show-delete-file-modal .del-file-ok').data('file-plan', filePlan);
        $('#show-delete-file-modal .del-file-ok').data('db-file-id', dbFileId);
        
        $('#show-delete-file-modal').modal('show');
    },
    delUploadedFiles: function() {
        var fileName = $(this).data('del-file-name');

        var user_id = window.localStorage.getItem("user_id");
        var filePlan = $(this).data('file-plan');
        var dbFileId = $(this).data('db-file-id');
        var userYear = window.localStorage.getItem("user_year");
       
        userYear = ( ! userYear ) ? new Date().getFullYear() : userYear;
        $.ajax({
            type: "POST",
            url: app.site_url,
            data: {
                action: 'delete_uploaded_file',
                mob_version: 'mob',
                file_name: fileName,
                user_year: userYear,
                file_plan: filePlan,
                user_id: user_id,
                db_file_id: dbFileId
            },
            success: function (result) {
                var res = $.parseJSON(result);
                if (res.status) {
                    $('#show-delete-file-modal').modal('hide');
                    app.getUploadedInfo();
                } else {
                    $('#show-delete-file-modal').modal('hide');
                    app.getUploadedInfo();
                }
            }
        });
    },
    getUploadedInfo: function() {
        var user_year = window.localStorage.getItem("user_year");
        var travelId = window.localStorage.getItem("travel_id");
        var data;
        var userPlanType = window.localStorage.getItem("plan_type");
        if (userPlanType == "traveling-plan") {
            userPlanType = "traveling_plan";
        }
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;
        var user_id = window.localStorage.getItem("user_id");
        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');
        $.ajax({
            type: "GET",
            url: app.site_url,
            data: {
                action: 'get_uploaded_custom_files',
                user_year: user_year,
                plan_type: userPlanType,
                id_number: user_id,
                travel_id: travelId
            },
            success: function (result) {
                app.uploadedFilesData = $.parseJSON(result);
                console.log(app.uploadedFilesData);
                app.renderUploadedFilesView();
                $('.container_loader').remove(); 
            }
        });
        
    },
    personBtn: function() {
        if (!$(this).hasClass('no-check')){
            this.value = this.value.replace(/[a-zA-Zа-яА-Яa-åA-Å\,\'!@#$%^&*=_~`<>|\\/]/, '');          
        }
    },
    renderPersonView: function() {
        
        var user_year = window.localStorage.getItem("user_year");
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;
        var user_id = window.localStorage.getItem("user_id");
       
        var html =
                '<div class="person-container"><div class="return_back"><img src="img/close.png" alt="Return"></div>' +
                '<h2 class="person-title">Personvernerklæring</h2>'+
                '<p>“app.skattogfradrag.no” eller “Selskapet” er forpliktet til å beskytte dine personopplysninger og ditt personvern. Denne personvernerklæringen beskriver informasjonspraksisen til app.skattogfradrag.no.</p>'+
                '<h3 class="person-list-title">1. Nettsider som dekkes av personvernerklæringen</h3>'+
                '<p>Denne personvernerklæringen beskriver informasjonspraksisen til nettsider som lenker til erklæringen: https://www.app.skattogfradrag.no (videre referert til som "app.skattogfradrag.no sine nettsider" eller "Selskapets nettsider").</p>'+

                '<p>Applikasjoner kan bli lagt ut av app.skattogfradrag.no eller tredjeparter. Når applikasjoner blir lagt ut av app.skattogfradrag.no, gjelder denne personvernerklæringen. Når applikasjoner blir lagt ut av en tredjepart, gjelder ikke denne personvernerklæringen men tredjeparts egen personvernerklæring.</p>'+

                '<p>app.skattogfradrag.no sine nettsider kan inneholde lenker til andre nettsider, og app.skattogfradrag.no er ikke ansvarlig for informasjonspraksis eller innhold på slike andre nettsider. Selskapet oppfordrer deg til å gjennomgå personvernerklæringene for andre nettsider for å forstå deres informasjonspraksis.</p>'+

                '<h3 class="person-list-title">2. Personopplysninger</h3>'+
                '<p>Samlet tilbyr app.skattogfradrag.no en rekke tjenester som kollektivt refereres til som "Tjenesten". app.skattogfradrag.no henter inn informasjon fra enkeltindivid som besøker Selskapets nettsider ("Besøkende") og enkeltindivid som registrerer seg for bruk av Tjenesten ("Kunder").</p>'+

                '<p>Når du uttrykker interesse for å motta ytterligere opplysninger om Tjenesten eller registrerer deg for å bruke Tjenesten, krever app.skattogfradrag.no at du oppgir kontaktinformasjon til Selskapet. Dette kan for eksempel være navn, firmanavn, adresse, telefonnummer og e-postadresse ("Påkrevd kontaktinformasjon"). app.skattogfradrag.no kan også be deg om å oppgi tilleggsinformasjon, som for eksempel firmaets årlige inntekter, antall ansatte eller industri ("Valgfri informasjon"). Påkrevd kontaktinformasjon, faktureringsdetaljer og valgfri informasjon henvises videre kollektivt til som "Data om app.skattogfradrag.no-kunder."</p>'+

                '<p>app.skattogfradrag.no kan også samle inn informasjon gjennom vanlige informasjonssamlingsverktøy mens du navigerer Selskapets nettsider. Dette kan for eksempel være informasjonskapsler (cookies) og nettvarder (beacons), videre referert til som "Nettsidens navigasjonsinformasjon”. Nettsidens navigasjonsinformasjon   inneholder standardinformasjon om nettleseren din (for eksempel nettlesertype og nettleserspråk), IP-adressen din (“IP”), og handlingene dine på Selskapets nettsider (for eksempel nettsider som vises og lenker som blir klikket på).</p>'+

                '<h3 class="person-list-title">3. Bruk av innsamlet informasjon</h3>'+
                '<p>Selskapet bruker innsamlet Data om app.skattogfradrag.no-kunder til å utføre de forespurte tjenestene. For eksempel, hvis du fyller ut et "kontakt meg"-webskjema, vil Selskapet bruke informasjonen som er gitt til å kontakte deg vedrørende din interesse for Tjenesten.</p>'+

                '<p>Selskapet kan også bruke innsamlet Data om app.skattogfradrag.no-kunder til markedsføringsformål. Selskapet kan blant annet bruke informasjon du oppgir for å kunne kontakte deg til å diskutere din interesse for app.skattogfradrag.no og Tjenesten, samt sende deg informasjon om Selskapet og dets partnere. Dette kan være informasjon om kampanjer og arrangementer.</p>'+
                '<p>app.skattogfradrag.no bruker Nettsidens navigasjonsinformasjon til å betjene og forbedre Selskapets nettsider. Selskapet kan også bruke Nettsidens navigasjonsinformasjon i kombinasjon med innhentet Data om  app.skattogfradrag.no-kunder for å kunne tilby personlig tilpasset informasjon om Selskapet.</p>'+

                '<h3 class="person-list-title">4.  Nettsidens navigasjonsinformasjon</h3>'+
                '<p>app.skattogfradrag.no bruker vanlige verktøy for innsamling av informasjon, for eksempel informasjonskapsler og nettvarder, mens du navigerer på Selskapets nettsider (“Nettsidens navigasjonsinformasjon”). Denne delen av personvernerklæringen beskriver hvilke typer navigasjonsinformasjon Selskapet kan samle inn og hvordan Selskapet kan bruke denne informasjonen.</p>'+

                '<h4 class="person-list-sub-title">Informasjonskapsler (cookies)</h4>'+
                '<p>app.skattogfradrag.no bruker informasjonskapsler for å gjøre samspillet mellom Selskapets nettsider enkelt og meningsfullt. Når du besøker en av Selskapets nettsider, sender app.skattogfradrag.no sine servere en informasjonskapsel til din datamaskin. Alene kan ikke informasjonskapsler identifisere deg, de gjenkjenner kun nettleseren din. Med mindre du velger å identifisere deg for app.skattogfradrag.no, enten ved å svare på et tilbud, åpne en brukerkonto eller fylle ut et webskjema (for eksempel et "kontakt meg"-skjema), forblir du anonym for Selskapet.</p>'+

                '<p>Det finnes to typer informasjonskapsler: sesjonsavhengige informasjonskapsler (session cookies) og faste informasjonskapsler (persistent cookies). Sesjonsavhengige informasjonskapsler eksisterer bare for en sesjon eller økt. De forsvinner når du lukker nettleseren eller slår av datamaskinen. Faste informasjonskapsler forblir på datamaskinen din etter at du har lukket nettleseren eller slått av maskinen.</p>'+

                '<p>Hvis du har valgt å identifisere deg for app.skattogfradrag.no bruker Selskapet sesjonsavhengige informasjonskapsler som inneholder kryptert informasjon. På den måten kan Selskapet gjøre en unik identifisering av deg. Hver gang du logger deg på Tjenesten blir en sesjonsavhengig informasjonskapsel lagret i nettleseren din, og denne inneholder en kryptert, unik identifikator som er knyttet til kontoen din. Disse sesjonsavhengige informasjonskapslene gir Selskapet muligheten til å identifiserer deg når du er logget inn i Tjenesten og til å behandle dine nettbaserte transaksjoner og forespørsler. Sesjonsavhengige informasjonskapsler er påkrevd for å bruke Tjenesten.</p>'+

                '<p>app.skattogfradrag.no bruker faste informasjonskapsler til å identifisere nettlesere som tidligere har besøkt Selskapets nettsider, og disse kan kun Selskapet lese og bruke. Når du kjøper Tjenesten eller gir Selskapet dine personlige opplysninger, tildeles du en unik identifikator. Denne unike identifikatoren er knyttet til en fast informasjonskapsel som Selskapet lagrer i nettleseren din. Selskapet er spesielt forsiktig med sikkerheten og konfidensialiteten til informasjonen som lagres i faste informasjonskapsler, og Selskapet lagrer for eksempel ikke passord i faste informasjonskapsler. Dersom du deaktiverer nettleserens evne til å godta informasjonskapsler, vil du kunne navigere Selskapets nettsider men ikke benytte deg av Tjenesten.</p>'+

                '<p>app.skattogfradrag.no kan bruke informasjon fra sesjonsavhengige og faste informasjonskapsler i kombinasjon med Data om app.skattogfradrag.no-kunder for å dele informasjon om Selskapet og Tjenesten med deg.</p>'+
                '<h4 class="person-list-sub-title">Nettvarder (beacons)</h4>'+
                '<p>app.skattogfradrag.no bruker nettvarder alene eller i kombinasjon med informasjonskapsler. Disse benyttes for å kompilere informasjon om bruk av Selskapets nettsider og samhandling med e-post fra Selskapet til Kunder og Besøkende. Nettvarder er tydelige elektroniske bilder som kan gjenkjenne bestemte typer informasjon på datamaskinen din, som informasjonskapsler, når du besøker et bestemt webområde som enten er tilknyttet nettvarden eller beskriver en nettside som er tilknyttet nettvarden. For eksempel kan app.skattogfradrag.no plassere nettvarder i e-postmeldinger innen markedsføring. Disse vil kunne informerer Selskapet om når du klikker på en kobling i e-postmeldingen som deretter leder deg til en av Selskapets nettsider. app.skattogfradrag.no bruker nettvarder til å drifte og forbedre Selskapets nettsider og e-postkommunikasjon. app.skattogfradrag.no kan bruke informasjon fra nettvarder i kombinasjon med Data om app.skattogfradrag.no-kunder for å dele informasjon om Selskapet og Tjenesten med deg.</p>'+

                '<h4 class="person-list-sub-title">IP-adresser</h4>'+
                '<p>Når du besøker nettsidene til app.skattogfradrag.no samler Selskapet din IP-adresse (“IP”) for å spore og aggregere identifiserbar ikke-personlig informasjon. For eksempel bruker app.skattogfradrag.no IP-adresser til å monitorere regionene hvor Kunder og Besøkende navigerer Selskapets nettsider fra.</p>'+

                '<p>app.skattogfradrag.no samler også IP-adresser fra Kunder når de logger på Tjenesten, som er en del av Selskapets sikkerhetsfunksjoner "Identity Confirmation" og "IP Range Restrictions".</p>'+

                '<h4 class="person-list-sub-title">Tredjeparts informasjonskapsler</h4>'+
                '<p>Fra tid til annen engasjerer app.skattogfradrag.no tredjeparter til å spore og analysere identifiserbar ikke-personlig bruk og volumstatistikkinformasjon fra individer som besøker Selskapets nettsider. app.skattogfradrag.no kan også bruke andre tredjeparts informasjonskapsler for å spore resultatene av Selskapets annonser. Informasjonen som leveres til en tredjepart inneholder ikke personlig informasjon, men er av en slik art at den kan tilknyttes personlig informasjon etter at Selskapet mottar den. Denne personvernerklæringen dekker ikke bruken av informasjonskapsler fra tredjeparter.</p>'+

                '<h3 class="person-list-title">5. Åpne forum, henvis en venn og kundeomtaler</h3>'+
                '<p>app.skattogfradrag.no kan tilby forum, blogger eller chatte-rom på Selskapets nettsider. Eventuell identifiserbar personlig informasjon du velger å oppgi på slike steder kan leses, innsamles og/eller brukes av andre som besøker disse nettsidene, og kan også brukes til å sende deg uønskede meldinger. app.skattogfradrag.no er ikke ansvarlig for den identifiserbare personlige informasjonen du velger å dele på slike nettsider.</p>'+

                '<p>Kunder og Besøkende kan velge å bruke Selskapets henvisningstjeneste for å informere venner om Selskapets nettsider. Når du bruker henvisningstjenesten ber Selskapet om din venns navn og e-postadresse. app.skattogfradrag.no sender deretter ut en engangs e-post som inviterer ham eller henne til å besøke Selskapets nettsider. app.skattogfradrag.no lagrer ikke denne informasjonen.</p>'+

                '<h3 class="person-list-title">6. Deling av innhentet informasjon</h3>'+
                '<p>app.skattogfradrag.no kan dele Data om app.skattogfradrag.no-kunder med Selskapets salgsagenter slik at disse på Selskapets vegne kan komme i kontakt med Kunder og Besøkende som har oppgitt sin kontaktinformasjon. app.skattogfradrag.no kan også dele Data om app.skattogfradrag.no-kunder med Selskapets salgsagenter for å sikre kvaliteten på informasjonen som tilbys. Identifiserbar personlig informasjon vil av app.skattogfradrag.no aldri deles, selges, leies ut eller brukes til handel for salgsfremmende formål med tredjeparter.<p>'+

                '<p>app.skattogfradrag.no forbeholder seg retten til å offentliggjøre identifiserbar personlig informasjon om Selskapets Kunder eller Besøkende dersom det kreves ved lov eller hvis Selskapet med rimelighet mener at en avsløring er nødvendig for å beskytte Selskapets rettigheter og/eller for å etterkomme en rettssak, ordre fra domstol eller juridisk prosess.</p>'+

                '<h3 class="person-list-title">7. Preferanser for kommunikasjon</h3>'+
                '<p>app.skattogfradrag.no tilbyr Kunder og Besøkende som oppgir sin kontaktinformasjon muligheten til å velge hvordan Selskapet bruker den innhentede informasjonen. Du kan sende en forespørsel med spesifisering av dine kommunikasjonspreferanser til hp@nagelstad.as. Kunder kan ikke reservere seg mot å motta transaksjonsrelaterte e-postmeldinger tilknyttet egen konto hos app.skattogfradrag.no eller Tjenesten.</p>'+

                '<h3 class="person-list-title">8. Endringer og oppdateringer</h3>'+
                '<p>Dine informasjon-kunder kan oppdatere eller endre registreringsinformasjonen sin ved å redigere sine bruker- eller organisasjonsoppføringer. Det er mulighet for at app.skattogfradrag.no kan tilby en løsning der du kan oppdatere en brukerprofil. For å oppdatere en organisasjons informasjon, vennligst logg inn på http://www.app.skattogfradrag.no med ditt app.skattogfradrag.no brukernavn og passord og klikk deg inn på «innstillinger."</p>'+

                '<h3 class="person-list-title">9. Kundedata</h3>'+
                '<p>Kunder av app.skattogfradrag.no som bruker Tjenesten til å hoste/verte data og informasjon ("Kundedata"). app.skattogfradrag.no vil aldri få gjennomgått, delt, distribuert eller referert til sine Kundedata, med unntak av det som er lovpålagt. Individuelle oppføringer av Kundedata kan kun vises eller åpnes med den hensikt å løse et problem, gi brukerstøtte til problemer eller ved mistanke ulovlig aktivitet. Kunder er ansvarlige for å opprettholde sikkerheten og konfidensialiteten til sine app.skattogfradrag.no brukernavn og passord.</p>'+

                '<h3 class="person-list-title">10. Sikkerhet</h3>'+
                '<p>app.skattogfradrag.no tar i bruk robuste sikkerhetstiltak for å beskytte Kundedata mot uautorisert tilgang, opprettholde dataens nøyaktighet og bidra til å sikre riktig bruk av Kundedata. Når Tjenesten benyttes vil Secure Socket Layer ("SSL") beskytte Kundedata ved hjelp av både serverautentisering og datakryptering. Disse teknologiene sørger for at Kundedataen er trygg, sikker og kun tilgjengelig for Kunden som informasjonen tilhører og de som Kunden har gitt informasjonstilgang til. app.skattogfradrag.no hoster/verter sine nettsider på sikre servere som anvender brannmurer og annen avansert teknologi for å hindre forstyrrelser eller tilgang fra uvedkommende.</p>'+

                '<p>Ettersom Selskapet bruker Tjenesten til å opprettholde Data om app.skattogfradrag.no-kunder er denne informasjonen sikret på samme måte som beskrevet ovenfor for Kundedata.</p>'+

                '<h3 class="person-list-title">11. Endringer i personvernerklæringen</h3>'+
                '<p>app.skattogfradrag.no forbeholder seg retten til å gjøre endringer i denne personvernerklæringen. app.skattogfradrag.no vil varsle om vesentlige endringer i denne personvernerklæringen via Selskapets nettsider minst tredve (30) virkedager før endringene trer i kraft.</p>'+

                '<h3 class="person-list-title">12. Kontakt oss</h3>'+
                '<p>Spørsmål angående denne personvernerklæringen eller informasjonspraksisen på Selskapets nettsider kan adresseres til:</p>'+

                '<p>Maximillian og Skatt & Fradrag Kunstnere AS Kristian Augusts gate 14, 0164 Oslo </br>Telefon: 950 26 188 </br>E-post: hp@nagelstad.as</p></div>'+
                
                "<script>jQuery('.return_back').on('click', app.checkToBackfunc);jQuery('#user_year').on('change', app.changeUserYear);jQuery('.log_out').on('click', app.userLogout);jQuery('.capture_photo').on('click',app.renderCameraView);jQuery('.select_photo').on('click', app.renderPlanView);</script>";;

        $('body').attr('class', 'person').html(html);
    },

    renderCameraView: function() {
        app.checkToBack = 'home';
        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }
        var cookie_check = window.localStorage.getItem("cookie_ok");
        if (cookie_check != 'ok') {
            var cookie_alert = "<div id='cookie-alert' class='cookie-notice-container'><span>Vi bruker informasjonskapsler for å gi deg en bedre brukeropplevelse. Les mer om vår personvernhåndtering </span><span class='person-btn'>her</span><span class='btn-cookie-ok'>Forstått</span></div>";
        } else {
            var cookie_alert = "";
        }
        var user_year = window.localStorage.getItem("user_year");
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;
        var user_id = window.localStorage.getItem("user_id");
        var user_plan_type = window.localStorage.getItem("plan_type");
        var currentTravelId = window.localStorage.getItem("travel_id");
        window.localStorage.setItem("user_year_loc", user_year);

        

        var sel_html = app.yearList();
        var html_options = '';
        var planVariation = '';
        var selevt_options = "<select id='myselect' name='carlist' style='max-width:500px;'>";
        var planType = false;
        var planMore = false;
        var ifInputAmpty = '';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=get_user_plan&user_id=" + encodeURIComponent(user_id) + "&user_year=" + encodeURIComponent(user_year) + "&plan_type=" + encodeURIComponent(user_plan_type) + "&trave_id=" + encodeURIComponent(currentTravelId));
        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);
            console.log(response);
            var travelIdSelectHtml = '';
            var addNewTravelHtml = '';

            if (user_plan_type == "traveling-plan") {

                if (currentTravelId == null || currentTravelId == "undefined") {
                    var last_travelind_id = response.message.length - 1;
                } else {
                    var last_travelind_id = currentTravelId;
                }

                travelIdSelectHtml += "<select id='user_travel_id' name='user_travel_id' style='max-width:500px;'>";
                $.each(response.message, function(index,el) {

                    let element_number = index + 1;  
                    let ifSelected = '';
                    if (last_travelind_id == index) {
                        ifSelected = ' selected="selected"';
                    }
                    travelIdSelectHtml += '<option value="'+index+'"'+ifSelected+'>'+ element_number +' - '+ el['Personal-info']['117']['value']+'</option>';
                });
                travelIdSelectHtml += "</select>";

                var globalPlanData = response.message[last_travelind_id];
            } else {
                var globalPlanData = response.message;
            }


            console.log(travelIdSelectHtml);

            if (response.status == '404') {
                $('.container_loader').remove();
                navigator.notification.alert(response.message, null, app.messageText, app.OKText);
            }else if (response.status == '200') {
                $.each(globalPlanData, function(el, list_options) {
                    var el_with_space = el.split('///').join(' ');
                    if (el_with_space == "Personal-info") {
                        return true;
                    }
                    selevt_options += "<option style='margin:20px 0px; color:red;' disabled value="+ el +">"+ el_with_space +"</option>";
                    html_options += '<div class="section_salgsinntekter first-sum"><div class="title">'+ el +'</div>';
                    html_options += '<div class="scoll_section">';

                    $.each(list_options, function(option_key, option_values) {
                    
                        selevt_options += "<option class='"+option_key+"' value='"+option_key+"'>"+option_key+" - "+option_values.label+"</option>";
                        html_options += '<div class="line"><span class="'+ option_key +'">'+ option_key +'</span><span data-r="left" class="'+ option_key +'_text">'+ option_values.label +'</span></div>';
                    });
                        html_options += '</div></div>';
                        
                });
                selevt_options += "</select>";
            }


                    var html =
                        "<div class='modal custom fade in' id='calculate_modal' aria-hidden='false' aria-labelledby='calculate_modal-label' role='dialog' tabindex='-1'>" +
                            "<div class='modal-dialog'>" +
                                "<div class='modal-content'>" +
                                    "<div class='modal-body'>" +
                                        "<div class='btl-formcontact'>" +
                                            "<p class='modal-window-title'>Vennligst velg en posteringskategori du ønsker å knytte bilaget opp mot:</p>" + travelIdSelectHtml+selevt_options+
                                            "<p class='modal-window-anotate'>Nummerformat: 1000.00</p><p class='amount-plan-title'>Beløp*</p><input type='number' name='user_plan_number' class='input-calc-numbers input_upload_numbers'/>"+
                                            "<p class='modal-window-error-input'>The field is empty or the format is not correct.</p>"+ 
                                            "<p class='amount-plan-title'>Kort beskrivelse</p><textarea class='upload-file-description' name='user_plan_description'></textarea>"+
                                            
                                            "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'><input type='button' class='submit_request calculate_new_value' value='OK'>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                        "<script>jQuery('#calculate_modal').on('hide.bs.modal', app.closeUploadsModal);jQuery('.rere').on('click', app.onPhotoDataSuccess);jQuery('.accessCamera').on('click', app.capturePhoto);jQuery('.accessLibrary').on('click', app.openLibrary);jQuery('.return_back').on('click',app.renderHomeView);jQuery('#user_year').on('change', app.changeUserYear);jQuery('.log_out').on('click', app.userLogout);jQuery('.calculate_new_value').on('click', app.llld);</script>";

        var sel_html = app.yearList();

        var html2 =
                "<div class='return_back'><img src='img/close.png' alt='Return'></div><div class='log_out'>Logg ut</div>" +cookie_alert+
                "<div class='select_year'><p class='title'>Velg år</p><select name='select_year' id='user_year'>" + sel_html + "</select></div>" +
                "<div class='camera_options accessCamera'><p>SEND INN KVITTERINGER</p><div class='img_camera'><img src='img/camera_single.png' alt='Camera'></div></div>" +
                "<button type='button' class='btn_general accessCamera'>Ta et bilde</button><button type='button' class='btn_general accessLibrary'>Last opp fra bibliotek</button><img style='display:none;' id='image_from_library' src=''><canvas style='display:none;' id='imgCanvas' />" +
                "<script>jQuery('.btn-cookie-ok').on('click', app.cookieOkFunction);jQuery('.person-btn').on('click', app.checkNeedToSavePerson);"+
                "</script>";

        $('body').attr('class', 'camera').html(html2);

        $('body').append(html);
        }
        xhr.send();
    },
    closeUploadsModal: function(e) {
        $('.modal-window-error-input').hide();
    },
    ddpp: function () {
        $.datepicker.regional['no'] = {
            closeText: 'Lukk',
            prevText: '&#xAB;Forrige',
            nextText: 'Neste&#xBB;',
            currentText: 'I dag',
            monthNames: ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'],
            monthNamesShort: ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'],
            dayNamesShort: ['søn','man','tir','ons','tor','fre','lør'],
            dayNames: ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],
            dayNamesMin: ['sø','ma','ti','on','to','fr','lø'],
            weekHeader: 'Uke',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
        };
        $.datepicker.setDefaults($.datepicker.regional['no']);
        
    },
    checkInputs: function () {
        $('.line').each( function(){
            if($(this).find('input').val() != '') {
                if($(this).hasClass('no-span')) {
                   $(this).removeClass('no-span'); 
                }
            } else {
                $(this).addClass('no-span')
            }
        });
    },
    renderPlanView: function() {
        app.checkToBack = 'home';
        if ( ! app.checkConnection() ) {
            navigator.notification.alert(app.noInternetConnection, null, app.messageText, app.OKText);
            return false;
        }
        var cookie_check = window.localStorage.getItem("cookie_ok");
        if (cookie_check != 'ok') {
            var cookie_alert = "<div id='cookie-alert' class='cookie-notice-container'><span>Vi bruker informasjonskapsler for å gi deg en bedre brukeropplevelse. Les mer om vår personvernhåndtering </span><span class='person-btn'>her</span><span class='btn-cookie-ok'>Forstått</span></div>";
        } else {
            var cookie_alert = "";
        }
        var user_year = window.localStorage.getItem("user_year");
        user_year = ( ! user_year ) ? new Date().getFullYear() : user_year;
        var user_id = window.localStorage.getItem("user_id");

        window.localStorage.setItem("user_year_loc", user_year);

        var user_plan_type = window.localStorage.getItem("plan_type");
        var currentTravelId = window.localStorage.getItem("travel_id");
        jQuery('body').append('<div class="container_loader"><div class="loader--text">'+ app.loadingText +'</div><div class="loader"><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div><div class="loader--dot"></div></div></div>');

        var sel_html = app.yearList();
        var html_options = '';
        var planVariation = '';
        var planType = false;
        var planMore = false;
        var ifInputAmpty = '';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", app.site_url + "?action=get_user_plan&user_id=" + encodeURIComponent(user_id) + "&user_year=" + encodeURIComponent(user_year)+"&plan_type="+encodeURIComponent(user_plan_type));

        xhr.onload = function(){
            
            var response = jQuery.parseJSON(xhr.responseText);
            console.log(response);
           
            // If traveking plan
            var travelIdSelectHtml = '';
            var addNewTravelHtml = '';
            if (user_plan_type == "traveling-plan") {
                if (currentTravelId == null || currentTravelId == "undefined") {
                    var last_travelind_id = response.message.length - 1;
                } else {
                    var last_travelind_id = currentTravelId;
                }
                $.each(response.message, function(index,el) {
                    let ifSelected = '';
                    if (last_travelind_id == index) {
                        ifSelected = ' selected="selected"';
                    }
                    travelIdSelectHtml += '<option value="'+index+'"'+ifSelected+'>'+el['Personal-info']['117']['value']+'</option>';
                });
                var globalPlanData = response.message[last_travelind_id];
                addNewTravelHtml += '<button type="button" class="btn_general add-new-travel-btn">Opprett ny reiseregning</button>';
            } else {
                var globalPlanData = response.message;
            }
            


            console.log(last_travelind_id);
            if (response.status == '404') {
                $('.container_loader').remove();
                navigator.notification.alert(response.message, null, app.messageText, app.OKText);
            }else if (response.status == '200') {
                
                if (response.planVariation == 'more-konstander' || response.planVariation == 'more-text-fields') {
                    planVariation = response.planVariation;
                    planType = true;
                    planMore = true;
                };

                $.each(globalPlanData, function(el, list_options) {
                    var el_with_space = el.split('///').join(' ');
                    if (planMore) {
                        if (planType){
                            if (planVariation == 'more-text-fields') {
                                html_options += '<div class="traveling-id-container">'+
                                '<select class="traveling-id-select" name="select-travel-id" value="">'+travelIdSelectHtml+'</select>'+addNewTravelHtml+
                                '</div><div class="section_salgsinntekter first-sum '+planVariation+'"><div class="title">REISEREGNING ENKELTPERSONFORETAK (EPF)</div>';
                            } else {
                                html_options += '<div class="section_salgsinntekter first-sum '+planVariation+'"><div class="title">'+ el_with_space +'</div>';
                            }
                            
                            // html_options += '<p>Date: <input type="text" class="datepicker"></p>';

                             
                        } else {
                            if (el_with_space == 'FieldsAfterCalculations') {
                                html_options += '<div class="clear"></div>';
                                html_options += '<div class="section-after-sum-fields"><div class="title">'+el_with_space+'</div>';
                            } else {
                                html_options += '<div class="section_kostnader second-sum"><div class="title">'+ el_with_space +'</div>';
                            }
                        }
                    } else {
                        html_options += '<div class="section_'+ el +'"><div class="title">'+ el +'</div>';
                    }

                    html_options += '<div class="scoll_section">';

                    $.each(list_options, function(option_key, option_values) {
                        if (el_with_space == 'FieldsAfterCalculations') {
                            option_values.label += ' per. 31.12.'+user_year;
                        }
                       ifInputAmpty = option_values.value == '' ? ' no-span' : '';
                       if (planVariation == 'more-text-fields' && planType) {
                            if (option_key == '117' || option_key == '118' || option_key == '121') {
                                html_options += '<div class="line'+ifInputAmpty+'"><span class="'+ option_key +'"> </span><span data-r="left" class="'+ option_key +'_text">'+ option_values.label +'</span><input type="text" name="'+ option_key +'" value="'+ option_values.value +'" class="'+ option_key +'_value"><div class="clear"></div></div>';
                            } else if (option_key == '119' || option_key == '120') {
                                html_options += '<div class="line'+ifInputAmpty+'"><span class="'+ option_key +'"></span><span data-r="left" class="'+ option_key +'_text">'+ option_values.label +'</span><input type="text" readonly="true" name="'+ option_key +'" value="'+ option_values.value +'" class="'+ option_key +'_value datepicker"><div class="clear"></div></div>';
                            } else {
                                html_options += '<div class="line'+ifInputAmpty+'"><span class="'+ option_key +'"></span><span data-r="left" class="'+ option_key +'_text">'+ option_values.label +'</span><textarea value="'+ option_values.value +'" name="'+ option_key +'" rows="3" class="'+ option_key +'_value no-check">'+ option_values.value +'</textarea><div class="clear"></div></div>';
                            }
                       } else if (planVariation == 'more-text-fields' || planVariation == 'more-konstander'){
                            html_options += '<div class="line'+ifInputAmpty+'"><span class="'+ option_key +'"></span><span data-r="left" class="'+ option_key +'_text text-with-year">'+ option_values.label +'</span><span data-name="'+ option_key +'" data-value-span="'+ option_values.value +'" class="plus-value span-calc-'+ option_key +'">+</span><input type="text" readonly="true" name="'+ option_key +'" value="'+ option_values.value +'" class="'+ option_key +'_value input-calc-numbers"><span data-name="'+ option_key +'" data-value-span="'+ option_values.value +'" class="minus-value span-calc-'+ option_key +'">-</span><div class="clear"></div></div>';
                       } else {
                        html_options += '<div class="line'+ifInputAmpty+'"><span class="'+ option_key +'">'+ option_key +'</span><span data-r="left" class="'+ option_key +'_text text-with-year">'+ option_values.label +'</span><span data-name="'+ option_key +'" data-value-span="'+ option_values.value +'" class="plus-value span-calc-'+ option_key +'">+</span><input type="text" readonly="true" name="'+ option_key +'" value="'+ option_values.value +'" class="'+ option_key +'_value input-calc-numbers"><span data-name="'+ option_key +'" data-value-span="'+ option_values.value +'" class="minus-value span-calc-'+ option_key +'">-</span><div class="clear"></div></div>';
                       }
                        
                    });
                    show_save_btn = "";
                    if (planMore) {
                        if (planVariation == 'more-text-fields') {
                            html_options += '</div></div>';
                            show_save_btn = "<button type='button' class='btn_general save_options'>Oppdater utregning</button>";
                        } else {
                            html_options += '</div><div class="total">Sum inntekter: <span class="current-total-value"></span> <span>kr</span></div></div>';
                        }
                        
                    } else {
                        if (el == 'kostnader') {
                            html_options += '</div></div>';
                        } else {
                            html_options += '</div><div class="total">Sum inntekter: <span class="total_value"></span> <span>kr</span></div></div>';
                        }
                    }
                    planType = false;
                });
                if (true) {}
                var html =
                        "<div class='return_back'><img src='img/close.png' alt='Return'></div><div class='log_out'>Logg ut</div>"  +cookie_alert+
                        "<script> $('.datepicker').datepicker({showWeek: false, firstDay: 1 });</script>"+
                        "<div class='select_year'><p class='title'>Velg år</p><select name='select_year' class='change_option_year' id='user_year'>" + sel_html + "</select></div>" +
                        "<div class='document "+planVariation+"'><form method='post' id='save_user_options_value'><p>Registrerte poster</p>" + html_options + "</form></div>" +show_save_btn+
                        // "<button type='button' class='btn_general save_options'>Oppdater utregning</button>
                        "<div class='total_kostnader'>Sum kostnader:  <span class='value'></span> <span>kr</span></div><div class='total_result'>Resultat <span class='result_year'>"+ user_year +"</span>:  <span class='value'></span> <span>kr</span></div>" +
                        "<div class='modal custom fade in' id='calculate_modal' aria-hidden='false' aria-labelledby='calculate_modal-label' role='dialog' tabindex='-1'>" +
                            "<div class='modal-dialog'>" +
                                "<div class='modal-content'>" +
                                    "<div class='modal-body'>" +
                                        "<div class='btl-formcontact'>" +
                                            "<p class='modal-window-title'>Add or minus new value</p>" +
                                            "<p class='modal-window-anotate'>Nummerformat: 1000.00</p>" +
                                            "<p class='modal-window-sub-title'>For example: 45 + 30 - 20</p>" +
                                            "<input type='number' name='formula_area'></input>" +
                                            "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'><input type='button' class='submit_request calculate_new_value' value='OK'>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                        "<div class='modal custom fade in' id='add-new-travel-modal' aria-hidden='false' aria-labelledby='calculate_modal-label' role='dialog' tabindex='-1'>" +
                            "<div class='modal-dialog'>" +
                                "<div class='modal-content'>" +
                                    "<div class='modal-body'>" +
                                        "<div class='btl-formcontact'>" +
                                            "<p class='modal-window-title'>Opprett ny reiseregning:</p>" +
                                            "<input class='new-travel-title-field' type='text' name='new-travel-title' placeholder='Skriv navn på reisen her' value=''></input>" +
                                            "<input type='button' class='cancel' data-dismiss='modal' value='Avbryt'><input type='button' class='submit_request calculate_new_value_travel' value='Create'>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                        "<script>jQuery('.btn-cookie-ok').on('click', app.cookieOkFunction);jQuery('.person-btn').on('click', app.checkNeedToSavePerson);app.checkInputs(); jQuery('.return_back').on('click',app.checkNeedToSave);jQuery('textarea').on('keyup', app.checkValue);jQuery('#user_year').on('change', app.checkNeedToSaveYear);jQuery('.log_out').on('click', app.checkNeedToSaveLogout);" +
                        "jQuery('.calculate_new_value').on('click', app.calculateString);app.calculateFields();jQuery('.save_options').on('click', app.saveOptions);jQuery('.traveling-id-select').on('change', app.changeTravelId);jQuery('.add-new-travel-btn').on('click',app.addNewTravelModal);jQuery('.calculate_new_value_travel').on('click',app.createNewTravel);</script>";
                        // jQuery('.save_options').on('click', app.saveOptions);jQuery('.input-calc-numbers').on('click', app.showCalculateModal);jQuery('.minus-value').on('click', app.showMinusCalculateModal);jQuery('.plus-value').on('click', app.showPlusCalculateModal);
                $('body').attr('class', 'report').html(html);
                $('body').addClass(planVariation);

            }

        }

        xhr.send();

    },

    receivedEvent: function(id) {

         console.log('Received Event: ' + id);
    }
};
