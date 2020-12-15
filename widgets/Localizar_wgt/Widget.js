define(['dojo/_base/declare', 'jimu/BaseWidget', "esri/SpatialReference", "esri/tasks/ProjectParameters", 'esri/tasks/GeometryService', "esri/geometry/Point", 'esri/geometry/Polygon', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleMarkerSymbol', 'dojo/_base/Color', "esri/layers/GraphicsLayer", 'esri/graphic', "jimu/dijit/Message", "esri/InfoTemplate", "esri/symbols/TextSymbol", "esri/symbols/Font", 'esri/dijit/util/busyIndicator', "esri/tasks/AreasAndLengthsParameters", 'https://unpkg.com/read-excel-file@4.x/bundle/read-excel-file.min.js'], function (declare, BaseWidget, SpatialReference, ProjectParameters, GeometryService, Point, Polygon, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color, GraphicsLayer, Graphic, Message, InfoTemplate, TextSymbol, Font, BusyIndicator, AreasAndLengthsParameters) {
    return declare([BaseWidget], {

        // Developer: Ing. Geógrafo Daniel Aguado H.
        // linkedin: https://www.linkedin.com/in/danielgis
        // WebSite: https://danielgis.github.io/

        // Custom widget code goes here

        baseClass: 'localizar-wgt',
        tabSelected: 'punto',
        obj_resultados: [],
        obj_index: 0,
        obj_resultados_xls: {},

        postCreate: function postCreate() {
            this.inherited(arguments);
            console.log('Localizar_wgt::postCreate');
            self_lw = this;
        },
        _showMessage: function _showMessage(message) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'message';

            switch (type) {
                case 'question':
                    var messagebox = new Message({
                        type: type,
                        titleLabel: 'Widget ' + this.nls._widgetLabel + ': ' + type,
                        message: message,
                        buttons: [{
                            label: 'SI',
                            onClick: lang.hitch(this, lang.hitch(this, function () {
                                messagebox.close();
                            }))
                        }, {
                            label: 'NO',
                            onClick: lang.hitch(this, lang.hitch(this, function () {
                                this._cleanMap();
                                messagebox.close();
                            }))
                        }]
                    });

                    break;
                default:
                    new Message({
                        type: type,
                        titleLabel: 'Widget ' + this.nls._widgetLabel + ': ' + type,
                        message: message
                    });
                    break;
            }
        },
        _tabToggleForm: function _tabToggleForm(evt) {
            self_lw.tabSelected = evt.currentTarget.id;
            if (evt.currentTarget.classList.contains('is-active')) {
                return;
            };
            dojo.query('.opcion_lw').forEach(function (node) {
                var container_option = self_lw[node.id + '_' + node.classList[0]];
                if (node.id == self_lw.tabSelected) {
                    node.classList.toggle('is-active');
                    container_option.classList.toggle('is-active');
                } else {
                    node.classList.remove('is-active');
                    container_option.classList.remove('is-active');
                }
            });
        },
        _validateCoordinateNumber_lw: function _validateCoordinateNumber_lw(evt) {
            var val = evt.currentTarget.value;
            var srid = self_lw.select_punto_opcion_lw.value;
            if (srid == self_lw.config.crs[0].epsg) {
                // Solo aplica para coordenadas geograficas
                evt.currentTarget.value = val.replace(/[^-0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/(\-.*)\-/g, '$1');
            } else {
                // Aplica para coordenadas UTM
                evt.currentTarget.value = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
            }
        },
        _populateSelectSistemReference_lw: function _populateSelectSistemReference_lw() {
            this.config.crs.forEach(function (i) {
                var opt = document.createElement("option");
                opt.value = i.epsg;
                opt.text = i.name_epsg;
                self_lw.select_punto_opcion_lw.add(opt);
            });
            this.select_poligono_opcion_lw.innerHTML = this.select_punto_opcion_lw.innerHTML;
        },
        _applyGraphic: function _applyGraphic(evt) {
            console.log(self_lw.tabSelected);
            switch (self_lw.tabSelected) {
                case 'punto':
                    self_lw._graphPoint();
                    break;
                case 'poligono':
                    self_lw._graphPolygon();
                    break;

                default:
                    break;
            }
        },
        _graphPoint: function _graphPoint() {
            // Captura del SRC seleccionado
            var srid = self_lw.select_punto_opcion_lw.value;

            if (srid == '') {
                self_lw._showMessage(self_lw.nls.err_sistema_referencial);
                self_lw.ap_select_punto_lw.classList.add('is-danger');
                return;
            }

            self_lw.ap_select_punto_lw.classList.remove('is-danger');

            var src = srid == '4326' ? 'gcs' : 'utm';

            // Validacion de cordenada X ingresada 
            var x = self_lw.ap_input_x_lw.value;

            if (!x) {
                self_lw.ap_input_x_lw.classList.add('is-danger');
                return;
            };

            // x = parseInt(x);

            if (!self_lw._validateCoordX(x, src)) {
                self_lw.ap_input_x_lw.classList.add('is-danger');
                self_lw.ap_help_x_lw.classList.add('is-active');
                self_lw.ap_help_x_lw.innerText = src == 'gcs' ? self_lw.nls.allowed_lon_values : self_lw.nls.allowed_este_values;
                return;
            };

            self_lw.ap_input_x_lw.classList.remove('is-danger');
            self_lw.ap_help_x_lw.classList.remove('is-active');

            // Validacion de cordenada Y ingresada
            var y = self_lw.ap_input_y_lw.value;

            if (!y) {
                self_lw.ap_input_y_lw.classList.add('is-danger');
                return;
            };

            // y = parseInt(y);

            if (!self_lw._validateCoordY(y, src)) {
                self_lw.ap_input_y_lw.classList.add('is-danger');
                self_lw.ap_help_y_lw.classList.add('is-active');
                self_lw.ap_help_y_lw.innerText = src == 'gcs' ? self_lw.nls.allowed_lat_values : self_lw.nls.allowed_norte_values;
                // self.ap_help_y_message_lw.classList.add('active')
                return;
            };

            self_lw.ap_input_y_lw.classList.remove('is-danger');
            self_lw.ap_help_y_lw.classList.remove('is-active');

            var geometryService = new GeometryService(self_lw.config.url_geometry_Server);

            var spatialReference = new SpatialReference({ wkid: parseInt(srid) });
            var point = new Point(parseFloat(x), parseFloat(y), spatialReference);
            var pointTransform = null;

            var parameters = new ProjectParameters();
            parameters.geometries = [point.normalize()];
            parameters.outSR = self_lw.map.spatialReference;
            parameters.transformForward = true;

            // var thiss = this;
            //thiss.map.addLayer(thiss.layer);
            geometryService.project(parameters);
            geometryService.on("project-complete", function (results) {
                pointTransform = results.geometries[0];
                var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));
                // let symbol = new SimpleMarkerSymbol();

                var graphic = new Graphic(pointTransform, symbol);
                console.log(graphic);
                if (graphic.geometry.x == "NaN" || graphic.geometry.y == "NaN") {
                    self_lw._showMessage(self_lw.nls.err_referenciar_coordenada);
                    // self_lw.obj_index = self_lw.obj_index - 1;
                    // console.log("No se puede referenciar la coordenada en el mapa");
                    return;
                }

                // self_lw.obj_index = self_lw.map.graphics.graphics.length;
                self_lw.obj_index = self_lw.obj_index + 1;
                var name = 'grafico_' + self_lw.obj_index;

                self_lw.obj_resultados.push(name);

                var graphicLayer = new GraphicsLayer({ id: name });

                var font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
                var txtSym = new TextSymbol(name, font, new Color([250, 0, 0, 0.9]));
                txtSym.setOffset(-15, -5).setAlign(TextSymbol.ALIGN_END);
                txtSym.setHaloColor(new Color([255, 255, 255]));
                txtSym.setHaloSize(1.5);
                var graphicLabel = new Graphic(pointTransform, txtSym);

                graphicLayer.add(graphic);
                graphicLayer.add(graphicLabel);

                self_lw.map.addLayer(graphicLayer);
                // self_lw.map.graphics.add(graphic);
                // self_lw.map.graphics.add(graphicLabel);
                // self_lw.map.centerAndZoom(pointTransform, 10);
                // self_lw._addResultados(graphic);
                // self_lw.ap_none_resultados_opcion_lw.hidden = true;
                // dojo.query('.container_resultados_lw').addClass('is-active')
                // self_lw.ap_resultados_lw.click();

                graphic.setInfoTemplate(new InfoTemplate("Coordenadas", "<span>Este / Long: </span>" + point.x + "<br />" + "<span>Norte / Lat: </span>" + point.y));
                self_lw.map.infoWindow.setTitle(graphic.getTitle());
                self_lw.map.infoWindow.setContent(graphic.getContent());
                self_lw.map.infoWindow.show(pointTransform);
                self_lw.map.centerAndZoom(pointTransform, 10);

                self_lw._addResultados(graphicLayer, name);
                self_lw.ap_none_resultados_opcion_lw.hidden = true;

                dojo.query('.container_resultados_lw').addClass('is-active');
                self_lw.ap_resultados_lw.click();
            });
            geometryService.on("error", function (error) {
                self_lw._showMessage(error.message, type = 'error');
                console.log(error);
            });
        },
        _graphPolygon: function _graphPolygon() {
            self_lw.busyIndicator_lw.show();

            if (self_lw.ap_upload_file_lw.value == "") {
                self_lw._showMessage(self_lw.nls.err_formato_invalido, type = 'error');
                self_lw.busyIndicator_lw.hide();
                return;
            }

            var srid = self_lw.select_poligono_opcion_lw.value;

            if (srid == '') {
                self_lw._showMessage(self_lw.nls.err_sistema_referencial);
                self_lw.ap_select_poligono_lw.classList.add('is-danger');
                self_lw.busyIndicator_lw.hide();
                return;
            };

            self_lw.ap_select_poligono_lw.classList.remove('is-danger');

            var rings = self_lw.obj_resultados_xls.slice(1);
            var polygonJson = { "rings": [rings], "spatialReference": { "wkid": parseInt(srid) } };

            var geometryService = new GeometryService(self_lw.config.url_geometry_Server);

            var polygon = new Polygon(polygonJson);
            var polygonTransform = null;

            var parameters = new ProjectParameters();
            parameters.geometries = [polygon];
            parameters.outSR = self_lw.map.spatialReference;
            parameters.transformForward = true;

            geometryService.project(parameters);
            geometryService.on("project-complete", function (results) {

                polygonTransform = results.geometries[0];

                self_lw.obj_index = self_lw.obj_index + 1;
                var name = 'grafico_' + self_lw.obj_index;
                self_lw.obj_resultados.push(name);

                var graphicLayer = new GraphicsLayer({ id: name });

                var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3), new Color([125, 125, 125, 0.35]));

                var graphic = new Graphic(polygonTransform, symbol);

                var font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
                var txtSym = new TextSymbol(name, font, new Color([250, 0, 0, 0.9]));
                // txtSym.setOffset(-15, -5).setAlign(TextSymbol.ALIGN_END)
                txtSym.setHaloColor(new Color([255, 255, 255]));
                txtSym.setHaloSize(1.5);

                var center = polygonTransform.getCentroid();

                var graphicLabel = new Graphic(center, txtSym);

                graphicLayer.add(graphic);
                graphicLayer.add(graphicLabel);

                self_lw.map.addLayer(graphicLayer);
                // self_lw.map.infoWindow.show(center);

                var areasAndLengthParams = new AreasAndLengthsParameters();
                areasAndLengthParams.lengthUnit = GeometryService.UNIT_METERS;
                areasAndLengthParams.areaUnit = GeometryService.UNIT_HECTARES;
                areasAndLengthParams.calculationType = "geodesic";
                areasAndLengthParams.polygons = [graphic.geometry];

                geometryService.areasAndLengths(areasAndLengthParams).then(function (results) {
                    var area = results.areas[0].toFixed(4);
                    var perimetro = results.lengths[0].toFixed(4);
                    graphic.setInfoTemplate(new InfoTemplate("Polígono", "<span>Área (ha): </span>" + area + "<br />" + "<span>Perímetro (m): </span>" + perimetro));
                    self_lw.map.infoWindow.setTitle(graphic.getTitle());
                    self_lw.map.infoWindow.setContent(graphic.getContent());
                    self_lw.map.infoWindow.show(center);
                });

                // self_lw.map.centerAndZoom(center, 10);
                self_lw.map.setExtent(graphic._extent, true);

                self_lw._addResultados(graphicLayer, name);
                self_lw.ap_none_resultados_opcion_lw.hidden = true;

                dojo.query('.container_resultados_lw').addClass('is-active');
                self_lw.ap_resultados_lw.click();

                self_lw.busyIndicator_lw.hide();
            });
            geometryService.on("error", function (error) {
                self_lw.busyIndicator_lw.hide();
                var messageErr = self_lw.nls.err_coordenadas_xlsx;
                self_lw._showMessage(messageErr, type = 'error');
            });
        },
        _validateCoordX: function _validateCoordX(x, src) {
            var response = true;
            x = parseFloat(x);
            switch (src) {
                case 'gcs':
                    response = x > -180 & x < 180 ? true : false;
                    return response;
                case 'utm':
                    response = x >= 0 & x < 1000000 ? true : false;
                    return response;
                default:
                    break;
            }
        },
        _validateCoordY: function _validateCoordY(y, src) {
            var response = true;
            y = parseFloat(y);
            switch (src) {
                case 'gcs':
                    response = y > -90 & y < 90 ? true : false;
                    return response;
                case 'utm':
                    response = y >= 0 & y < 10000000 ? true : false;
                    return response;
                default:
                    break;
            }
        },
        _addResultados: function _addResultados(graphicLayer, name) {
            // self_lw.obj_index = self_lw.obj_index + 1;
            // let id_label = `grafico_${self_lw.obj_index}`;
            // let id = `${name}_lw`
            var i_class = self_lw.tabSelected == 'punto' ? 'far fa-dot-circle' : 'fas fa-draw-polygon';
            var icon_elm = '<span class="icon is-small"><i class="' + i_class + '"></i></span>';

            var tr = dojo.create('tr');

            // self_lw.obj_resultados[id] = {
            //     idx_graph: self_lw.obj_index - 1,
            //     idx_label: self_lw.obj_index,
            //     extent: graph._extent
            // }
            var td_array = [];
            td_array.push('<td>' + icon_elm + '</td>');
            td_array.push('<td id="' + name + '_name" class="has-text-left" contenteditable=\'true\'>' + name + '</td>');
            td_array.push('<td><span id="' + name + '_ext" class="icon is-small"><i class="fas fa-search"></i></span></td>');
            td_array.push('<td><span id="' + name + '_del" class="icon is-small" style="color: #FF5722;"><i class="far fa-trash-alt"></i></span></td>');

            var tds = td_array.join('');

            // let tds = `<td>${icon_elm}</td><td id="${name}_name" class="has-text-left" contenteditable='true'>${name}</td><td><span id="${name}_ext" class="icon is-small"><i class="fas fa-search"></i></span></td>`;
            tr.id = name;
            tr.innerHTML = tds;
            tr.style.cursor = "pointer";
            self_lw.ap_resultados_body_lw.appendChild(tr);
            dojo.query('#' + name + '_ext').on('click', self_lw._zoomToExtentByResult);
            dojo.query('#' + name + '_name').on('input', self_lw._editaNameResult);
            dojo.query('#' + name + '_del').on('click', self_lw._deleteResult);
        },
        _zoomToExtentByResult: function _zoomToExtentByResult(evt) {
            var id = evt.currentTarget.id.replace('_ext', '');
            var lyr = self_lw.map.getLayer(id);
            self_lw.map.setExtent(lyr.graphics[0]._extent, true);
        },
        _editaNameResult: function _editaNameResult(evt) {
            var id = evt.currentTarget.id.replace('_name', '');
            self_lw.map.getLayer(id).graphics[1].symbol.text = evt.currentTarget.innerText;
            self_lw.map.getLayer(id).refresh();
        },
        _deleteResult: function _deleteResult(evt) {
            var id = evt.currentTarget.id.replace('_del', '');
            var elem = dojo.query('#' + id);
            self_lw.map.removeLayer(self_lw.map.getLayer(id));
            elem[0].parentNode.removeChild(elem[0]);
        },
        _uploadFile: function _uploadFile(evt) {
            self_lw.busyIndicator_lw.show();
            if (!evt.currentTarget.files[0]) {
                self_lw.busyIndicator_lw.hide();
                return;
            };
            var name = evt.currentTarget.files[0].name;

            if (!name.endsWith('.xlsx')) {
                self_lw._showMessage(self_lw.nls.err_formato_invalido, type = 'error');
                self_lw.busyIndicator_lw.hide();
                return;
            }

            readXlsxFile(evt.currentTarget.files[0]).then(function (data) {
                self_lw.ap_upload_file_name_lw.innerText = name;

                self_lw.ap_container_upload_file_lw.classList.remove('is-danger');
                self_lw.ap_help_message_lw.classList.remove('has-text-danger');

                self_lw.ap_container_upload_file_lw.classList.add('is-primary');
                self_lw.obj_resultados_xls = data;

                self_lw.ap_help_message_lw.classList.add('has-text-primary');
                self_lw.ap_help_message_lw.innerText = self_lw.nls.suc_cargar_archivo;
                self_lw.busyIndicator_lw.hide();
            }).catch(function (error) {
                self_lw.ap_container_upload_file_lw.classList.remove('is-primary');
                self_lw.ap_help_message_lw.classList.remove('has-text-primary');

                self_lw.ap_container_upload_file_lw.classList.add('is-danger');
                self_lw.ap_help_message_lw.classList.add('has-text-danger');
                self_lw.ap_help_message_lw.innerText = self_lw.nls.err_cargar_archivo;
                self_lw._showMessage(error.message, type = 'error');
                self_lw.busyIndicator_lw.hide();
            });
        },
        _onChangeSelectSRC: function _onChangeSelectSRC(evt) {
            var srid = evt.target.value;
            if (srid == self_lw.config.crs[0].epsg) {
                self_lw.ap_input_x_lw.placeholder = "Longitud";
                self_lw.ap_input_y_lw.placeholder = "Latitud";
                self_lw.ap_input_label_x_lw.innerText = self_lw.nls.title_longitud;
                self_lw.ap_input_label_y_lw.innerText = self_lw.nls.title_latitud;
            } else {
                self_lw.ap_input_x_lw.placeholder = "Este";
                self_lw.ap_input_y_lw.placeholder = "Norte";
                self_lw.ap_input_label_x_lw.innerText = self_lw.nls.title_este;
                self_lw.ap_input_label_y_lw.innerText = self_lw.nls.title_norte;
                var val_x = self_lw.ap_input_x_lw.value;
                var val_y = self_lw.ap_input_y_lw.value;
                self_lw.ap_input_x_lw.value = val_x.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                self_lw.ap_input_y_lw.value = val_y.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
            }
        },
        startup: function startup() {
            this.inherited(arguments);
            console.log('Localizar_wgt::startup');
            this.busyIndicator_lw = BusyIndicator.create({
                target: this.domNode.parentNode.parentNode.parentNode,
                backgroundOpacity: 0
            });
            dojo.query('.opcion_lw').on('click', this._tabToggleForm);
            dojo.query('.btn_aplicar_lw').on('click', this._applyGraphic);
            dojo.query('.upload_file_lw').on('change', this._uploadFile);
            dojo.query('.select_punto_opcion_cls').on('change', this._onChangeSelectSRC);
            this._populateSelectSistemReference_lw();
        }
    }
    // onOpen() {
    //   console.log('Localizar_wgt::onOpen');

    // },
    // onClose(){
    //   console.log('Localizar_wgt::onClose');
    // },
    // onMinimize(){
    //   console.log('Localizar_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Localizar_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Localizar_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Localizar_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Localizar_wgt::onPositionChange');
    // },
    // resize(){
    //   console.log('Localizar_wgt::resize');
    // }
    );
});
//# sourceMappingURL=Widget.js.map
