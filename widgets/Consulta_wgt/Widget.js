define(['dojo/_base/declare', 'jimu/BaseWidget', 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos', "esri/tasks/query", "esri/tasks/QueryTask", "esri/tasks/StatisticDefinition", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/graphic"], function (declare, BaseWidget, lang, LayerInfos, Query, QueryTask, StatisticDefinition, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic) {
    return declare([BaseWidget, Query, QueryTask, StatisticDefinition], {

        // Custom widget code goes here

        baseClass: 'consulta-wgt',
        iniClause: '1=1',
        field_dc_tipo_persona: 'TIPO_PERSONA',
        layersMap: [],

        field_dep_nm_depa: 'NM_DEPA',
        field_dep_cd_depa: 'CD_DEPA',

        field_prov_nm_prov: 'NM_PROV',
        field_prov_cd_prov: 'CD_PROV',

        field_dist_nm_dist: 'NM_DIST',
        field_dist_cd_dist: 'CD_DIST',

        field_codigou_dm: 'CODIGOU',

        controller_query: '', // Permite identificar la opcion de consulta seleccionada

        controller_ubigeo: '',

        temporal_class_results: '',

        postCreate: function postCreate() {
            self_cw = this;
            this.inherited(arguments);
            // console.log('Consulta_wgt::postCreate');;
            this._getAllLayers();
        },
        _getAllLayers: function _getAllLayers() {
            _layerInfosObjClone = [];
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
                this.layersMap = layerInfosObj;
            }));
        },
        _getDataByTipoPersona: function _getDataByTipoPersona() {
            var id = self_cw.config.layer_id_dc;
            var feature_dc = this.layersMap.getLayerInfoById(id);
            var queryTask = new QueryTask(feature_dc.getUrl());
            var query = new Query();
            query.where = self_cw.field_dc_tipo_persona + ' IS NOT NULL';
            query.returnGeometry = false;
            query.returnDistinctValues = true;
            query.outFields = [self_cw.field_dc_tipo_persona];
            queryTask.execute(query, function (results) {
                var result_options = results.features.map(function (i) {
                    return i.attributes[self_cw.field_dc_tipo_persona];
                });
                result_options.forEach(function (element) {
                    opt = document.createElement("option");
                    opt.value = element;
                    opt.text = element;
                    self_cw.select_tipo_persona_cw.add(opt);
                });
                opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.select_tipo_persona_cw.add(opt);
            });
        },
        _getDataByDepartamento: function _getDataByDepartamento() {
            var id = self_cw.config.layer_id_dep;
            var feature_dep = this.layersMap.getLayerInfoById(id);
            var queryTask = new QueryTask(feature_dep.getUrl());
            var query = new Query();
            query.where = self_cw.field_dep_cd_depa + ' <> 99';
            query.returnGeometry = false;
            query.outFields = [self_cw.field_dep_nm_depa, self_cw.field_dep_cd_depa];
            query.orderByFields = [self_cw.field_dep_nm_depa];
            queryTask.execute(query, function (results) {
                var result_options = results.features.map(function (i) {
                    return i.attributes;
                });
                result_options.forEach(function (element) {
                    opt = document.createElement("option");
                    opt.value = element[self_cw.field_dep_cd_depa];
                    opt.text = element[self_cw.field_dep_nm_depa];
                    self_cw.departamento_cw.add(opt);
                });
                opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.departamento_cw.add(opt);
            });
        },
        _getDataByProvincia: function _getDataByProvincia(evt) {
            var cd_depa = evt.target.value;
            self_cw.controller_ubigeo = cd_depa;

            self_cw.distrito_cw.innerHTML = '';
            self_cw.container_distrito_cw.classList.remove('active');

            var id = self_cw.config.layer_id_prov;
            if (cd_depa == '') {
                // self_cw.config.layer_id_prov = ''
                self_cw.container_provincia_cw.classList.remove('active');
                // self_cw.container_distrito_cw.classList.remove('active');
                return;
            }

            var feature_prov = this.layersMap.getLayerInfoById(id);
            var queryTask = new QueryTask(feature_prov.getUrl());
            var query = new Query();
            query.where = self_cw.field_dep_cd_depa + ' = \'' + cd_depa + '\'';
            query.returnGeometry = false;
            query.outFields = [self_cw.field_prov_nm_prov, self_cw.field_prov_cd_prov];
            query.orderByFields = [self_cw.field_prov_nm_prov];
            queryTask.execute(query, function (results) {
                self_cw.provincia_cw.innerHTML = "";
                // self_cw.distrito_cw.innerHTML = '';
                var result_options = results.features.map(function (i) {
                    return i.attributes;
                });
                result_options.forEach(function (element) {
                    opt = document.createElement("option");
                    opt.value = element[self_cw.field_prov_cd_prov];
                    opt.text = element[self_cw.field_prov_nm_prov];
                    self_cw.provincia_cw.add(opt);
                });
                opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.provincia_cw.add(opt);
            });
            if (!self_cw.container_provincia_cw.classList.contains('active')) {
                self_cw.container_provincia_cw.classList.toggle('active');
            };

            self_cw._zoomExtendSelected(self_cw.config.layer_id_dep, query.where);
        },
        _getDataByDistrito: function _getDataByDistrito(evt) {
            var cd_prov = evt.target.value;
            if (cd_prov == '') {
                self_cw.controller_ubigeo = self_cw.controller_ubigeo.substring(0, 2);
                self_cw.container_distrito_cw.classList.remove('active');
                return;
            }
            self_cw.controller_ubigeo = cd_prov;
            var id = self_cw.config.layer_id_dist;
            var feature_dist = this.layersMap.getLayerInfoById(id);
            var queryTask = new QueryTask(feature_dist.getUrl());
            var query = new Query();
            query.where = self_cw.field_prov_cd_prov + ' = \'' + cd_prov + '\'';
            query.returnGeometry = false;
            query.outFields = [self_cw.field_dist_nm_dist, self_cw.field_dist_cd_dist];
            query.orderByFields = [self_cw.field_dist_nm_dist];
            queryTask.execute(query, function (results) {
                self_cw.distrito_cw.innerHTML = "";
                var result_options = results.features.map(function (i) {
                    return i.attributes;
                });
                result_options.forEach(function (element) {
                    opt = document.createElement("option");
                    opt.value = element[self_cw.field_dist_cd_dist];
                    opt.text = element[self_cw.field_dist_nm_dist];
                    self_cw.distrito_cw.add(opt);
                });
                opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.distrito_cw.add(opt);
            });
            if (!self_cw.container_distrito_cw.classList.contains('active')) {
                self_cw.container_distrito_cw.classList.toggle('active');
            }

            self_cw._zoomExtendSelected(self_cw.config.layer_id_prov, query.where);
        },
        _getDistritoSelected: function _getDistritoSelected(evt) {
            var cd_dist = evt.target.value;
            whereDefinition = self_cw.field_dist_cd_dist + ' = \'' + cd_dist + '\'';
            if (cd_dist == '') {
                self_cw.controller_ubigeo = self_cw.controller_ubigeo.substring(0, 4);
                return;
            }
            self_cw.controller_ubigeo = cd_dist;
            self_cw._zoomExtendSelected(self_cw.config.layer_id_dist, whereDefinition);
        },
        _addEventToLayerQuery: function _addEventToLayerQuery() {
            dojo.query(".capa_consulta_cw").on('click', self_cw._setFormContainer);
        },
        _setFormContainer: function _setFormContainer(evt) {
            var title = evt.currentTarget.innerText;
            // var id = evt.currentTarget.id;
            self_cw.controller_query = evt.currentTarget.id;
            self_cw.titulo_consulta.innerText = title;
            self_cw.ListaCapasConsulta.hidden = true;

            var nodeContainer_cw = dojo.query(".container_cw");
            dojo.toggleClass(nodeContainer_cw[0], 'active');
            dojo.query('.formulario_cw').forEach(function (node) {
                if (node.dataset.dojoAttachPoint.includes(self_cw.controller_query)) {
                    node.hidden = false;
                } else {
                    node.hidden = true;
                }
            });
        },
        _returnListaCapasConsulta: function _returnListaCapasConsulta() {
            var nodeContainer_cw = dojo.query(".container_cw");
            dojo.toggleClass(nodeContainer_cw[0], 'active');
            self_cw.ListaCapasConsulta.hidden = false;
        },
        _addEventToTabsOptions: function _addEventToTabsOptions() {
            dojo.query('.opcion_cw').on('click', self_cw._connectTabsWithOptionContainer);
        },
        _connectTabsWithOptionContainer: function _connectTabsWithOptionContainer(evt) {
            var option = evt.currentTarget.innerText.toLowerCase();
            if (evt.currentTarget.classList.contains('is-active')) {
                return;
            };
            dojo.query('.opcion_cw').forEach(function (node) {
                var container_option = self_cw[node.id + '_' + node.classList[0]];
                if (node.innerText.toLowerCase() == option) {
                    node.classList.toggle('is-active');
                    container_option.classList.toggle('active');
                } else {
                    node.classList.remove('is-active');
                    container_option.classList.remove('active');
                }
            });
        },
        _validateRucNumber: function _validateRucNumber(evt) {
            var val = evt.currentTarget.value;
            evt.currentTarget.value = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        },
        _openPopupAutocamitcally: function _openPopupAutocamitcally(featureInfo, center, whereDefinition) {
            var query = new Query();
            query.where = whereDefinition;
            featureInfo.layerObject.queryFeatures(query, function (results) {
                self_cw.map.infoWindow.setFeatures(results.features);
                self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
                self_cw.map.centerAt(center);

                // self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
            });
        },
        _zoomDmExtentToMap: function _zoomDmExtentToMap(evt) {

            // self_cw._applyQueryDM.click()
            var id = evt.currentTarget.innerText;
            query = new Query();
            query.where = self_cw.field_codigou_dm + ' = \'' + evt.currentTarget.innerText + '\'';
            var id_layer = self_cw.config.layer_id_dm;
            var feature = self_cw.layersMap.getLayerInfoById(id_layer);

            feature.getLayerObject().then(function (response) {
                self_cw.map.graphics.clear();
                response.queryFeatures(query, function (results) {
                    console.log(results.features);
                    if (results.features.length) {
                        var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3), new Color([125, 125, 125, 0.35]));

                        var ext = results.features[0].geometry.getExtent();

                        var graphic = results.features[0].setSymbol(symbol);
                        self_cw.map.graphics.add(graphic);
                        self_cw.map.setExtent(ext, true);
                    } else {
                        alert(`No se encontro el derecho minero ${id}, por tanto no es posible su referencia en el mapa`);
                        // self_cw.ap_alerta_resultados_cw.classList.toggle('active');
                    }
                }, function (error) {
                    alert(error);
                });
            }, function (error) {
                alert(error);
            });
        },
        _zoomExtendSelected: function _zoomExtendSelected(idService, whereDefinition) {
            var query = new Query();
            query.where = whereDefinition;
            var feature = this.layersMap.getLayerInfoById(idService);
            feature.getLayerObject().then(function (results) {
                results.queryExtent(query, function (res) {
                    if (res.count) {
                        self_cw.map.setExtent(res.extent, true);
                    } else {
                        // self_cw.ap_alerta_resultados_cw.classList.toggle('active');
                        alert('No se encontro el elemento ' + whereDefinition + ', por tanto no es posible su referencia en el mapa');
                    }
                }, function (error) {
                    alert(error);
                });
            }, function (error) {
                alert(error);
            });
        },
        _applyQuery: function _applyQuery(evt) {
            self_cw.ap_registros_encontrados_cw.innerHTML = '';
            switch (self_cw.controller_query) {
                case 'dc':
                    self_cw._applyQueryDC();
                    // console.log('Ejecutando proces dc');
                    break;
                case 'dm':
                    self_cw._applyQueryDM();
                    // console.log('Ejecutando proces dm');
                    break;
                default:
                    break;
            }
        },
        _populateResultsDC: function _populateResultsDC(arrayResults) {
            arrayResults.forEach(function (r, i) {
                if (self_cw.temporal_class_results) {
                    var newRow = self_cw.temporal_class_results;
                } else {
                    var newRow = dojo.clone(self_cw.ap_template_registros_resultados_cw);
                }

                newRow.style.display = 'block';

                var nodeTitle = dojo.query('.title_registros_cw', newRow)[0];
                newRow.getElementsByClassName('title_registros_cw')[0].innerText = i + 1 + '. ' + r['MINERO_INFORMAL'];
                newRow.getElementsByClassName('title_registros_cw')[0].id = r['ID'];
                dojo.connect(nodeTitle, 'onclick', self_cw._showPopupRowSelectedClick);

                // Lista campos

                var fieldsList = [];
                fieldsList.push('<li>RUC: ' + r['M_RUC'] + '</li>');
                fieldsList.push('<li>Nombre DM: ' + r['DERECHO_MINERO'] + '</li>');
                fieldsList.push('<li>C\xF3digo DM: <span class="tag is-primary codigou_cw">' + r['ID_UNIDAD'] + '<span></li>');

                fieldsListNode = fieldsList.join('');

                newRow.getElementsByClassName('detalle_registros_resultados_cw')[0].innerHTML = fieldsListNode;

                // dojo.query('.codigou_cw').on('click', self_cw._zoomDmExtentToMap)

                self_cw.ap_registros_encontrados_cw.appendChild(newRow);
            });
            dojo.query('.codigou_cw').on('click', self_cw._zoomDmExtentToMap);
        },
        _showReinfos: function _showReinfos(evt) {
            var id = evt.currentTarget.parentElement.getAttribute('value');
            var elm = dojo.query('.ul_registro_dc_' + id);

            // if (elm.length) {
            //     if (elm[0].contains('active')) {
            //         elm[0].hidden = true;
            //         return
            //     } else {
            //         elm[0].hidden = false;
            //         elm[0].toggle('active');
            //         return
            //     }
            // }
            if (evt.currentTarget.parentElement.classList.contains('active')) {
                if (elm.length) {
                    evt.currentTarget.parentElement.removeChild(elm[0]);
                    evt.currentTarget.parentElement.classList.toggle('active');
                }
                return;
            }

            // let id = evt.currentTarget.parentElement.getAttribute('value');
            var feature = self_cw.layersMap.getLayerInfoById(self_cw.config.layer_id_dc);

            var feature_sys = self_cw.layersMap.getLayerInfoById(self_cw.config.layer_id_dc_sys);

            var query = new Query();
            query.where = 'ID_UNIDAD = \'' + id + '\'';

            feature.setFilter(query.where);
            feature.show();

            feature_sys.setFilter(query.where);
            feature_sys.show();

            // evt.currentTarget.parentElement.classList.toggle('active')

            feature.getLayerObject().then(function (response) {
                response.queryFeatures(query, function (results) {
                    if (results.features.length) {
                        evt.target.parentElement.classList.toggle('active');
                        var rownum = results.features.length;
                        var data = results.features.map(function (i) {
                            return i.attributes;
                        });
                        var lidata = data.map(function (i, index) {
                            return '<li class="registro_dc" id="' + i['ID'] + '"><a>' + index + '. ' + i['M_RUC'] + ' - ' + i['MINERO_INFORMAL'] + '</a></li>';
                        });
                        var lidataString = lidata.join('');
                        var ulnode = dojo.create('ul');
                        ulnode.innerHTML = lidataString;
                        dojo.addClass(ulnode, 'ul_registro_dc_' + id);
                        evt.target.parentElement.appendChild(ulnode);
                        dojo.query('.registro_dc').on('click', self_cw._showPopupRowSelectedClick);
                    } else {
                        alert('No se encontraron REINFOS');
                    }
                }, function (error) {
                    alert(error);
                });
            }, function (error) {
                alert(error);
            });
        },
        _populateResultsDM: function _populateResultsDM(arrayResults) {
            arrayResults.forEach(function (r, i) {
                if (self_cw.temporal_class_results) {
                    var newRow = self_cw.temporal_class_results;
                } else {
                    var newRow = dojo.clone(self_cw.ap_template_registros_resultados_cw);
                }

                newRow.style.display = 'block';

                var nodeTitle = dojo.query('.title_registros_cw', newRow)[0];
                newRow.getElementsByClassName('title_registros_cw')[0].innerText = i + 1 + '. Codigou: ' + r['CODIGOU'];
                newRow.getElementsByClassName('title_registros_cw')[0].id = r['CODIGOU'];
                dojo.connect(nodeTitle, 'onclick', self_cw._showPopupRowSelectedClickDM);

                // Lista campos

                var fieldsList = [];
                fieldsList.push('<li>Nombre DM: ' + r['CONCESION'] + '</li>');
                fieldsList.push('<li>Sustancia: ' + r['SUSTANCIA'] + '</li>');
                fieldsList.push('<li value="' + r['CODIGOU'] + '"><span class="tag is-primary reinfos_cw">Ver reinfos<span></li>');

                fieldsListNode = fieldsList.join('');

                newRow.getElementsByClassName('detalle_registros_resultados_cw')[0].innerHTML = fieldsListNode;

                self_cw.ap_registros_encontrados_cw.appendChild(newRow);
            });
            dojo.query('.reinfos_cw').on('click', self_cw._showReinfos);
        },
        _showPopupRowSelectedClick: function _showPopupRowSelectedClick(evt) {
            var id_row = evt.currentTarget.id;

            var id_layer = self_cw.config.layer_id_dc;
            var id_layer_sys = self_cw.config.layer_id_dc_sys;

            var feature = self_cw.layersMap.getLayerInfoById(id_layer);
            var feature_sys = self_cw.layersMap.getLayerInfoById(id_layer_sys);

            var whereDefinition = 'ID = ' + id_row;

            feature_sys.setFilter(whereDefinition);

            feature_sys.layerObject.queryFeatures(whereDefinition, function (results) {
                var center = results.features[0].geometry;
                self_cw._openPopupAutocamitcally(feature, center, whereDefinition);
            });
        },
        _openPopupAutocamitcally2: function _openPopupAutocamitcally2(featureLayer, center) {
            self_cw.map.infoWindow.setFeatures(featureLayer.features);
            self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
            self_cw.map.centerAt(center);
        },
        _showPopupRowSelectedClickDM: function _showPopupRowSelectedClickDM(evt) {
            var id_row = evt.currentTarget.id;

            var id_layer = self_cw.config.layer_id_dm;

            var feature = self_cw.layersMap.getLayerInfoById(id_layer);

            var whereDefinition = 'CODIGOU = \'' + id_row + '\'';

            query = new Query();
            query.where = whereDefinition;

            // feature_sys.setFilter(whereDefinition);

            feature.getLayerObject().then(function (response) {
                response.queryFeatures(query, function (results) {
                    if (results.features.length) {
                        var center = results.features[0].geometry.getCentroid();
                        var ext = results.features[0].geometry.getExtent();
                        self_cw._openPopupAutocamitcally2(results, center, query);
                        self_cw.map.setExtent(ext, true);
                    }
                }, function (error) {
                    alert(error);
                });
            }, function (error) {
                alert(error);
            });

            // feature_sys.layerObject.queryFeatures(whereDefinition, function(results) {
            //     var center = results.features[0].geometry;
            //     self_cw._openPopupAutocamitcally(feature, center, whereDefinition);
            // })
        },
        _applyQueryDC: function _applyQueryDC() {
            whereDefinitionArray = [];

            // self_cw.ap_registros_encontrados_cw.innerHTML = '';

            if (self_cw.input_ruc_dc_cw.value != '') {
                var ruc_dc = '(m_ruc like \'%' + self_cw.input_ruc_dc_cw.value + '%\')';
                whereDefinitionArray.push(ruc_dc);
            }

            var nombre_dc = '(lower(minero_informal) like lower(\'%' + self_cw.input_nombre_dc_cw.value + '%\'))';
            whereDefinitionArray.push(nombre_dc);

            if (self_cw.select_tipo_persona_cw.value != '') {
                var tipo_persona_dc = '(tipo_persona like \'%' + self_cw.select_tipo_persona_cw.value + '%\')';
                whereDefinitionArray.push(tipo_persona_dc);
            };

            var codigou_dc = '(upper(id_unidad) like upper(\'%' + self_cw.input_codigou_dc_cw.value + '%\'))';
            whereDefinitionArray.push(codigou_dc);

            var nombredm_dc = '(lower(derecho_minero) like lower(\'%' + self_cw.input_nombre_dm_dc_cw.value + '%\'))';
            whereDefinitionArray.push(nombredm_dc);

            var ubigeo_dc = '(id_ubigeo_inei like \'' + self_cw.controller_ubigeo + '%\')';
            whereDefinitionArray.push(ubigeo_dc);

            var whereDefinition = whereDefinitionArray.join(' and ');

            // Filtro a capa DC visible en la TOC
            var id = self_cw.config.layer_id_dc;
            var feature = self_cw.layersMap.getLayerInfoById(id);
            feature.setFilter(whereDefinition);
            feature.show();

            // Filtro a capa DC sistema no visible en la TOC
            var id_sys = self_cw.config.layer_id_dc_sys;
            var feature_sys = self_cw.layersMap.getLayerInfoById(id_sys);
            feature_sys.setFilter(whereDefinition);
            feature_sys.show();

            // Ocultando los mensajes de alerta frente a errores
            // self_cw.ap_alerta_resultados_cw.classList.remove('active');

            // Realizando el query a la capa
            feature.layerObject.queryFeatures(whereDefinition, function (result) {
                var rowcount = result.features.length;
                self_cw.ap_indicador_resultados_cw.innerText = rowcount;
                self_cw.ap_titulo_resultados_cw.innerText = self_cw.titulo_consulta.innerText + ' encontrados';

                var data = result.features.map(function (i) {
                    return i.attributes;
                });
                // console.log(data);

                self_cw._populateResultsDC(data);

                self_cw.ap_none_resultados_opcion_cw.hidden = true;
                var class_list_container_resultados = self_cw.container_resultados_opcion_cw.classList;
                if (!class_list_container_resultados.contains('active')) {
                    self_cw.container_resultados_opcion_cw.classList.toggle('active');
                }
                self_cw.ap_resultados_cw.click();
            });

            // if (self_cw.ap_indicador_resultados_cw.innerText == '0') {
            //     return
            // };

            feature_sys.layerObject.queryExtent(whereDefinition, function (results) {
                if (results.count) {
                    self_cw.map.setExtent(results.extent, true);
                }
            });

            // List results
            // Change view results
            // Open popup when click list
        },
        _applyQueryDM: function _applyQueryDM() {
            whereDefinitionArray = [];
            var codigou_dm = '(upper(codigou) like upper(\'%' + self_cw.input_codigou_dm_cw.value + '%\'))';
            var nombredm_dm = '(lower(concesion) like lower(\'%' + self_cw.input_nombre_dm_cw.value + '%\'))';
            whereDefinitionArray.push(codigou_dm);
            whereDefinitionArray.push(nombredm_dm);

            var whereDefinition = whereDefinitionArray.join(' and ');

            // console.log(whereDefinition);

            // Filtro a capa DC visible en la TOC
            var id = self_cw.config.layer_id_dm;
            var feature = self_cw.layersMap.getLayerInfoById(id);
            feature.setFilter(whereDefinition);
            feature.show();

            // self_cw.ap_alerta_resultados_cw.classList.remove('active');

            var query = new Query();
            query.where = whereDefinition;

            feature.getLayerObject().then(function (response) {
                response.queryFeatures(query, function (results) {
                    var rowcount = results.features.length;
                    self_cw.ap_indicador_resultados_cw.innerText = rowcount;
                    self_cw.ap_titulo_resultados_cw.innerText = self_cw.titulo_consulta.innerText + ' encontrados';
                    if (rowcount) {
                        var data = results.features.map(function (i) {
                            return i.attributes;
                        });
                        self_cw._populateResultsDM(data);
                    }
                    self_cw.ap_none_resultados_opcion_cw.hidden = true;
                    var class_list_container_resultados = self_cw.container_resultados_opcion_cw.classList;
                    if (!class_list_container_resultados.contains('active')) {
                        self_cw.container_resultados_opcion_cw.classList.toggle('active');
                    }
                    self_cw.ap_resultados_cw.click();
                }, function (error) {
                    alert(error);
                });
                response.queryExtent(query, function (results) {
                    if (results.count) {
                        self_cw.map.setExtent(results.extent, true);
                    } else {
                        alert('No se encontraron elementos');
                    }
                }, function (error) {
                    alert(error);
                });
            }, function (error) {
                alert(error);
            });
        },
        startup: function startup() {
            this.inherited(arguments);
            console.log('Consulta_wgt::startup');
            self_cw._addEventToTabsOptions();
            self_cw._addEventToLayerQuery();
            self_cw._getDataByTipoPersona();
            self_cw._getDataByDepartamento();
        },
        onOpen: function onOpen() {
            console.log('Consulta_wgt::onOpen');
        }
    }
    // onClose(){
    //   console.log('Consulta_wgt::onClose');
    // },
    // onMinimize(){
    //   console.log('Consulta_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Consulta_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Consulta_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Consulta_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Consulta_wgt::onPositionChange');
    // },
    // resize(){
    //   console.log('Consulta_wgt::resize');
    // }
    );
});
//# sourceMappingURL=Widget.js.map
