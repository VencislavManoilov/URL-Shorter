$(document).ready(function() {
    $('#short_url').hide();
    $('#short_url_label').hide();
    $('#send').hide();
    
    function checkInputs() {
        const originalUrl = $('#original_url').val().trim();
        const isCustomChecked = $('#custom').is(':checked');
        const shortUrl = $('#short_url').val().trim();

        if (originalUrl && (!isCustomChecked || (isCustomChecked && shortUrl))) {
            $('#send').slideDown();
        } else {
            $('#send').slideUp();
        }
    }

    $('input[name="options"]').change(function() {
        if ($('#custom').is(':checked')) {
            $('#short_url').show();
            $('#short_url_label').show();
        } else {
            $('#short_url').hide();
            $('#short_url_label').hide();
        }
        checkInputs();
    });

    $('#original_url, #short_url').on('input', function() {
        checkInputs();
    });

    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    $('#send').click(function() {
        const originalUrl = $('#original_url').val().trim();
        const isCustomChecked = $('#custom').is(':checked');
        const shortUrl = isCustomChecked ? $('#short_url').val().trim() : null;

        let data;
        if(isCustomChecked) {
            data = {
                url: originalUrl,
                newURL: shortUrl
            };
        } else {
            data = {
                url: originalUrl
            }
        }

        $.ajax({
            url: '/shorten', 
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                $("#send").slideUp();
                $("#link-info").slideDown();
                $("#link").text('/' + response.url);
                $("#link").attr('href', '/' + response.url);
            },
            error: function(error) {
                // Handle error response
                console.log('Error:', error);
            }
        });
    });
});