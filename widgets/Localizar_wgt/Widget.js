define(['dojo/_base/declare', 'jimu/BaseWidget', "esri/SpatialReference", "esri/tasks/ProjectParameters", 'esri/tasks/GeometryService', "esri/geometry/Point", 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleMarkerSymbol', 'dojo/_base/Color', 'esri/graphic', "jimu/dijit/Message"], function (declare, BaseWidget, SpatialReference, ProjectParameters, GeometryService, Point, SimpleLineSymbol, SimpleMarkerSymbol, Color, Graphic, Message) {
    return declare([BaseWidget], {

        // Custom widget code goes here

        baseClass: 'localizar-wgt',
        tabSelected: '',

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
        _applyGraphic: function _applyGraphic(evt) {
            switch (tabSelected) {
                case 'punto':
                    this._graphPoint();
                    break;
                case 'poligono':

                    break;

                default:
                    break;
            }
        },
        _graphPoint: function _graphPoint() {
            // Captura del SRC seleccionado
            var srid = self_lw.select_punto_opcion_lw.value;

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
                return;
            };

            self_lw.ap_input_x_lw.classList.remove('is-danger');

            // Validacion de cordenada Y ingresada
            var y = self_lw.ap_input_y_lw.value;

            if (!y) {
                self_lw.ap_input_y_lw.classList.add('is-danger');
                return;
            };

            // y = parseInt(y);

            if (!self_lw._validateCoordY(y, src)) {
                self_lw.ap_input_y_lw.classList.add('is-danger');
                return;
            };

            self_lw.ap_input_y_lw.classList.remove('is-danger');

            var geometryService = new GeometryService("https://geoportal.minem.gob.pe/minem/rest/services/Utilities/Geometry/GeometryServer");

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
                    self_lw._showMessage("No se puede referenciar la coordenada en el mapa");
                    // console.log("No se puede referenciar la coordenada en el mapa");
                    return;
                }
                self_lw.map.graphics.add(graphic);
                self_lw.map.centerAndZoom(pointTransform, 10);
                // graphic.setInfoTemplate(new InfoTemplate("Coordenadas", "<span>Este (X):</span>" + point.x + "<br />" +"<span>Norte (Y):</span>" + point.y + "<br />"));
                // thiss.map.infoWindow.setTitle(graphic.getTitle());
                // thiss.map.infoWindow.setContent(graphic.getContent());
                // thiss.map.infoWindow.show(point2);
            });
            geometryService.on("error", function (error) {
                self_lw._showMessage(error.message, type = 'error');
                console.log(error);
            });
        },
        _validateCoordX: function _validateCoordX(x, src) {
            var response = true;
            x = parseFloat(x);
            switch (src) {
                case 'gcs':
                    response = x >= -180 & x <= 180 ? true : false;
                    return response;
                case 'utm':
                    response = x >= 0 & x <= 500000 ? true : false;
                    return response;
                    break;
                default:
                    break;
            }
        },
        _validateCoordY: function _validateCoordY(y, src) {
            var response = true;
            y = parseFloat(y);
            switch (src) {
                case 'gcs':
                    response = y >= -90 & y <= 90 ? true : false;
                    return response;
                case 'utm':
                    response = y >= 0 & y <= 10000000 ? true : false;
                    return response;
                    break;
                default:
                    break;
            }
        },
        startup: function startup() {
            this.inherited(arguments);
            console.log('Localizar_wgt::startup');
            dojo.query('.opcion_lw').on('click', this._tabToggleForm);
            dojo.query('.btn_aplicar_lw').on('click', this._graphPoint);
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
