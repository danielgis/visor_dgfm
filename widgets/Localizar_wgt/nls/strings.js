define({
    root: {
        _widgetLabel: 'Localizar',
        widgetTitle: 'Localizar',
        description: 'Widget que permite la localizar limites politicos (Departamento, provincia, distrito) o coordenadas',
        tab_punto: 'Punto',
        tab_poligono: 'Polígono',
        tab_resultados: 'Resultados',
        title_sistema_referencial: 'Sistema Referencial',
        opt_sistema_referencial_default: 'Seleccione una opción',
        title_este: 'ESTE (X)',
        title_norte: 'NORTE (Y)',
        title_longitud: 'Longitud (X)',
        title_latitud: 'Latitud (Y)',
        title_btn_aplicar: 'Aplicar',
        title_seleccione_excel: 'Seleccione un archivo excel (*.xlsx)',
        msg_ningun_archivo_seleccionado: 'Ningun archivo seleccionado...',
        msg_ayuda_excel: 'El archivo en formato *xlsx a cargar puede soportar hasta 10k filas y debe contener la estructura de columnas siguiente:',
        msg_sin_resultados: 'No hay ningún resultado',
        msg_descargar_excel: 'Descargue formato excel de prueba',
        msg_descargar_aqui: 'aquí',
        tb_head_geometria: 'G',
        tb_head_nombre: 'Nombre',
        tb_head_ver: 'ver',
        allowed_este_values: 'Valores permitidos: ESTE < 1000000',
        allowed_norte_values: 'Valores permitidos: NORTE < 10000000',
        allowed_lat_values: 'Valores permitidos: -90 < lat < 90',
        allowed_lon_values: 'Valores permitidos: -180 < lat < 180',
        // mensaje satisfactorios (suc: success)
        suc_cargar_archivo: 'El archivo *.xlsx se cargó correctamente',
        // mensajes de error (err: error)
        err_sistema_referencial: 'Debe seleccionar un Sistema de Referencia Espacial',
        err_referenciar_coordenada: 'No se puede referenciar la coordenada en el mapa',
        err_formato_invalido: 'Debe cargar un archivo en formato *.xlsx"',
        err_cargar_archivo: 'Ocurrio un error al cargar el archivo',

        err_coordenadas_xlsx: 'Ocurrio un inconveniente al intentar graficar. Verifique si los parámetros ingresados o las coordenadas cargadas en el formato *.xlsx pertenecen al sistema de referencia seleccionado.'

    }
    // add supported locales below:
    // , "zh-cn": true
});