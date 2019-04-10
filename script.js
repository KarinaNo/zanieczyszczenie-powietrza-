$(document).ready(function() {
    var countryName; //nazwa pańśtwa
    var cityName = []; //nazwa miasta
    var cityDescription = []; //opis miasta;
    var checkText = 'bc'; //parametry zanieczyszczenia powietrza, domyślnie bc
    getCookies("country");
    $("#search-button").click(function() {
        switch ($('#search-input').val()) {
            case 'Poland':
                countryName = 'PL';
                break;
            case 'Germany':
                countryName = 'DE';
                break;
            case 'Spain':
                countryName = 'ES';
                break;
            case 'France':
                countryName = 'FR';
                break;
            default:
                countryName = null;
                alert("Select Poland, Germany, Spain or France");
        }
        $("h1").text('The 10 most polluted cities for ' + checkText + ' parameter in ' + $('#search-input').val());
        if (countryName != null) {
            getMeasurements(checkText);
            createAccordion();
        }

        setCookies("country", countryName);
        getCookies("country");
    });

    $("input[type=\"radio\"").click(function() {
        checkText = $("input:checked").val();
    });

    //funkcja pobierająca dzisiejszą date w formacie yyyy-mm-dd
    function getCurrentDate() {
        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth() + 1; // liczymy od 0
        var year = today.getFullYear();
        if (day < 10)
            day = '0' + day;
        if (month < 10)
            month = '0' + month;
        date = year + '-' + month + '-' + day;
        return date;
    }

    //pobranie parametrów dla danego miasta z dnia dzisiejszego dla różnych lokalizacji
    //link wygenerowany na podstawie narzędzia https://dolugen.github.io/openaq-browser/#/measurements
    function getMeasurements(para) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: 'https://api.openaq.org/v1/measurements?country=' + countryName + '&order_by=value&date_from=' + getCurrentDate() + '&date_to=' + getCurrentDate() + '&sort=desc&limit=10&parameter=' + para,
            data: "{}",
            dataType: "json",
            success: function(data) {
                for (var i = 0; i < data.results.length; i++) {

                    cityName[i] = data.results[i].city;
                    createWkikArticle(i);

                }
                return true;
            },
            error: function(result) {
                alert("Error");
            }
        });
    }

    function createAccordion() { //utworzenie accordion
        $(".accordion").remove();
        $(".panel").remove();

        for (var i = 0; i < 10; i++) {
            $("#accordionId").append(
                "<button class=\"accordion\">" + cityName[i] +
                "</button>" +
                "<div class=\"panel\">" +
                "<p>" + cityDescription[i] + "</p>" +
                "</div>"
            );
        }

        var acc = document.getElementsByClassName("accordion");
        var i;

        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            });
        }
    }

    //utworzenie artykółów na podstawie nazw miast 
    function createWkikArticle(i) {
        $.ajax({
            type: "GET",
            url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityName[i] + '&format=json&callback=?',
            async: false,
            dataType: "json",
            success: function(data) {
                cityDescription[i] = data[2][0].toString();
                //console.log(data[2][0]);
            },
            error: function(errorMessage) {}
        });
    }

    //tworzymy pliki cookies
    function setCookies(name, value) {
        var cookies = escape(name) + '=' + escape(value) + ';';
        document.cookie = cookies;
        // console.log(cookies.toString());
    }

    //pobieramy pliki cookies
    function getCookies(name) {
        var value = name + '=';
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var newCookie = cookies[i];
            while (newCookie.charAt(0) === ' ') {
                newCookie = newCookie.substring(1, newCookie.length);
            }
            if (newCookie.indexOf(value) === 0) {
                console.log(newCookie.substring(value.length, newCookie.length));
                return newCookie.substring(value.length, newCookie.length);
            }
        }
        return null;
    }
});