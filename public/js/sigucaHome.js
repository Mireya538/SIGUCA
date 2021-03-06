
    //Declaramos el objeto socket que se conectará en este caso a localhost
    //var socket = io.connect('http://siguca.greencore.int');
    var socket = io.connect('http://localhost:3000');


    //Si estamos conectados, muestra el log y cambia el mensaje
    socket.on('connected', function () {
        selectValue();
    });

    function selectValue(){
        var value = $('#selectFiltro').val();
        //alert(value);
        socket.emit('listar', value);
    }

    $('#selectFiltro').change(function(){
        $('#cal').empty();
        selectValue();
    });


    //Se recibe result de la consulta
    socket.on('listaCierre', function(cierre){
        var stats = {};
        for (var d in cierre)
            stats[cierre[d].epoch] = cierre[d].estado;
        calendario(stats, [2, 5, 10, 15, 20]);
    });

    socket.on('listaCierreEmpleado', function(result){
        var stats = {};
        if(result.tipo == "general")
            for (var d in result.cierre)
                stats[result.cierre[d].epoch] = result.cierre[d].estado;
        else{
            if(result.tipo == "justificaciones")
                for (var d in result.cierre)
                    stats[result.cierre[d].epoch] = result.cierre[d].justificaciones;
            else{
                if(result.tipo == "solicitudes")
                    for (var d in result.cierre)
                        stats[result.cierre[d].epoch] = result.cierre[d].solicitudes;
                else
                    for (var d in result.cierre)
                        stats[result.cierre[d].epoch] = result.cierre[d].marcas;
            }
        }
        calendario(stats, [2, 5, 10]);
    });

    $('#selectMotivo').change(function (){
        if($('#selectMotivo').val() == 'otro') $("#motivoOtro").removeAttr('disabled');
        else $("#motivoOtro").attr('disabled','disabled');
    });

    $('#selectMotivoJust').change(function (){
        if($('#selectMotivoJust').val() == 'otro') $("#motivoOtroJust").removeAttr('disabled');
        else $("#motivoOtroJust").attr('disabled','disabled');
    });


    //Si nos desconectamos, muestra el log y cambia el mensaje.
    socket.on('disconnect', function () {
        console.log('Desconectado!');
    });


function calendario(stats, array){

    var cal = new CalHeatMap();
    cal.init({
        itemSelector: "#cal",
        domain: "month",
        subDomain: "x_day", //"x_hour",
        subDomainTextFormat: "%d",
        weekStartOnMonday: false,
        range: 1,
        cellSize: 24,
        domainGutter:   5, // separa los meses
        tooltip: true, // muestra el fecha y hora de cada cuadro
        data: stats,
        previousSelector: "#previous",
        nextSelector: "#next",
        highlight: "now", //señala la hora actual.
        label: {
            position: "top"
        },
        legend: array,
        legendCellSize: 15,
        legendColors: {
            min: "#00C322",//"#74D943",//"#00C322",
            max: "#F66F89",//"#EA4868",//"#FF0D00",
            empty: "#95EE6B",//en caso de que sea 0
            base: "#95EE6B",
            overflowing: "#EA4868"
        },
        legendTitleFormat: {
            lower: "Menos de {min} {name}",
            inner: "Entre {down} y {up} {name}",
            upper: "Mas de {max} {name}",
            overflowing: "Tardias"
        },
        legendHorizontalPosition: "right",
        //legendVerticalPosition: "top",
        itemName: "evento",
        onClick: function(date, nb) {
            var departamento = $('#selectFiltro').val();
            var usuario = $('#marca').val();
            $.get('/reportarEventos', {dia: date, departamentoId: departamento, id: usuario}, function( data ) {
                $( "#calDetalle" ).html('<tr><td> Justificaciones </td><td>' + data.justificaciones+  '</td></tr>' +
                                        '<tr><td> Solicitudes </td><td>' + data.solicitudes +  '</td></tr>' +
                                        '<tr><td> Ausencias o Tardías </td><td>' + data.marcas + '</td></tr>');
                var html = '';
                for (var i = 0; i < data.marcasPersonales.length; i++) {

                    var fecha = new Date(0);
                    fecha.setUTCSeconds(data.marcasPersonales[i].epoch);
                        var m = fecha.getMinutes(),
                            s = fecha.getSeconds();

                        data.marcasPersonales[i].fecha = fecha.getHours();
                        m < 10 ? data.marcasPersonales[i].fecha += ":0" + m : data.marcasPersonales[i].fecha += ":" + m ;
                        s < 10 ? data.marcasPersonales[i].fecha += ":0" + s : data.marcasPersonales[i].fecha += ":" + s ;
                    html += '<tr><td>' + data.marcasPersonales[i].tipoMarca + '</td><td>' + data.marcasPersonales[i].fecha + '</td></tr>';
                };
                $( "#marcasDetalle" ).html(html);
            });

        }
    });
};