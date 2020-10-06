define(['dojo/_base/declare', 'jimu/BaseWidget', 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos', "esri/tasks/query", "esri/tasks/QueryTask", "esri/tasks/StatisticDefinition", 'dojo/on', "esri/geometry/Point", '../../libs/chartjs/chartjs-plugin-labels'], function (declare, BaseWidget, lang, LayerInfos, Query, QueryTask, StatisticDefinition, on, Point) {
    return declare([BaseWidget, Query, QueryTask, StatisticDefinition], {

        // Desarrollador: Ing. Geógrafo Daniel Aguado H.
        // linkedin: https://www.linkedin.com/in/danielgis
        // WebSite: https://danielgis.github.io/

        // Custom widget code goes here

        baseClass: 'estadisticas-wgt',

        // add additional properties here
        layersMap: [],
        iniClause: '1=1',

        // Elementos del grafico de barras vertical
        // feature_id_vertical_bar: '',
        field_x_vertical_bar: 'DEPARTAMENTO',
        field_y_vertical_bar: 'COUNT_DEPARTAMENTO',
        label_y_vertical_bar: 'Numero de Reinfos',

        // Elementos del gráfico de torta
        // feature_id_vertical_bar: '',
        field_x_pie: 'M_TIPO_PERSONA',
        field_y_pie: 'COUNT_M_TIPO_PERSONA',
        label_y_pie: 'Tipo de persona',

        // Elementos del grafico de barras horizontal
        // feature_id_vertical_bar: '',
        field_x_horizontal_bar: 'ORIGEN',
        field_y_horizontal_bar: 'COUNT_ORIGEN',
        label_y_horizontal_bar: 'Origen',

        field_dep_nm_depa: 'NM_DEPA',
        field_dep_cd_depa: 'CD_DEPA',

        chart_tipo_persona: null,
        chart_tipo_origen: null,
        widthPanel: 360,

        // Almacena el valor de la ultima region seleccionada
        controller_query: null,

        postCreate: function postCreate() {
            self_ew = this;
            this._getAllLayers();
            this.panel = this.getPanel();
            // this.panel.position.width = 720
            // this.panel.setPosition(this.panel.position);
            // this.panel.panelManager.normalizePanel(this.panel);
        },
        _getAllLayers: function _getAllLayers() {
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
                this.layersMap = layerInfosObj;
            }));
        },
        _configureStylePanelWidget: function _configureStylePanelWidget() {
            var create = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            // let panel = this.getPanel();
            var panel_child = this.panel.getChildren()[0];

            var styleElement = document.createElement("style");
            if (!create) {
                var panel_child_child = panel_child.domNode.children;
                panel_child.domNode.removeChild(panel_child_child[panel_child_child.length - 1]);
                panel_child.domNode.style.backgroundColor = 'white';
                return;
            }
            panel_child.domNode.style.backgroundColor = '#333';
            var style_thumb = '::-webkit-scrollbar-thumb {border-radius: 0px; opacity: 0.6; background: #999999;}';
            var style_scrollbar = '::-webkit-scrollbar {border-radius: 0px; width: 6px; background-color: #333; height: 6px;}';
            var style_background = '.jimu-widget-frame.jimu-container {background-color: white;}';

            styleElement.appendChild(document.createTextNode(style_scrollbar));
            styleElement.appendChild(document.createTextNode(style_thumb));
            styleElement.appendChild(document.createTextNode(style_background));
            panel_child.domNode.appendChild(styleElement);
        },
        _indicatorReinfo: function _indicatorReinfo() {
            var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self_ew.iniClause;

            var query = new Query();
            query.where = where;
            query.returnCountOnly = true;
            // let url = this.feature_dc_tb.getUrl();
            var queryTask = new QueryTask(this.feature_dc_tb_url);
            queryTask.executeForCount(query, function (results) {
                var el = self_ew.odometer_ew;
                od = new Odometer({ el: el, value: 0, format: '' });
                od.update(0);
                el.innerHTML = results;
            }, function (error) {
                console.log(error);
            });
        },
        _controllerZoom: function _controllerZoom(extent) {
            var screenPoint = self_ew.map.toScreen(self_ew.map.extent.getCenter());
            var upperLeftScreenPoint = new Point(screenPoint.x - self_ew.widthPanel, screenPoint.y - self_ew.widthPanel);
            var upperLeftMapPoint = self_ew.map.toMap(upperLeftScreenPoint);
            var distance = self_ew.map.extent.getCenter().x - upperLeftMapPoint.x;
            extent.xmax = extent.xmax + distance;
            return extent;
        },
        _zoomToRegion: function _zoomToRegion(evt) {
            var backColor = [];
            var where_dep = void 0;
            var where_dc = void 0;
            var colorSelected = '#00feca';
            var colorAnother = '#36a2eb';

            var i = this.getElementAtEvent(evt);
            if (i.length == 0) {
                return;
            }

            self_ew.feature_dc.hide();
            self_ew.feature_dc.setFilter(this.iniClause);

            var value = this.data.labels[i[0]._index];

            if (value == self_ew.controller_query) {
                colorSelected = colorAnother;
                where_dc = self_ew.iniClause;
                where_dep = self_ew.iniClause;
                self_ew.ap_title_indicador_ew.innerHTML = self_ew.nls.title_indicador + '<br/>' + self_ew.nls.title_indicador_nacional;
            } else {
                where_dc = 'lower(' + self_ew.field_x_vertical_bar + ') = lower(\'' + value + '\')';
                where_dep = 'lower(' + self_ew.field_dep_nm_depa + ') = lower(\'' + value + '\')';
                self_ew.controller_query = value;
                self_ew.ap_title_indicador_ew.innerHTML = self_ew.nls.title_indicador + '<br/>' + value;
            }

            i[0]._yScale.ticks.forEach(function (elm, idx) {
                idx == i[0]._index ? backColor.push(colorSelected) : backColor.push(colorAnother);
            });
            this.active[0]._chart.config.data.datasets[0].backgroundColor = backColor;
            this.update();

            var query = new Query();
            query.where = where_dep;
            query.outSpatialReference = self_ew.map.spatialReference;
            queryTask = new QueryTask(self_ew.feature_dep.getUrl());

            queryTask.executeForExtent(query, function (results) {
                self_ew.map.setExtent(results.extent, true);
            }, function (error) {
                console.log(error);
            });

            self_ew.feature_dc.setFilter(where_dc);
            self_ew.feature_dc.show();

            self_ew._indicatorReinfo(where = where_dc);
            self_ew._drawPieChart(where_dc, process = 'update');
            self_ew._drawHorizontalBarChart(where_dc, process = 'update');
        },
        _drawVerticalBarChart: function _drawVerticalBarChart() {
            var url = this.feature_dc_tb.getUrl();

            var queryTask = new QueryTask(url);
            var query = new Query();

            query.where = this.iniClause;
            query.groupByFieldsForStatistics = [self_ew.field_x_vertical_bar];

            var countStatDef = new StatisticDefinition();
            countStatDef.statisticType = "count";
            countStatDef.onStatisticField = self_ew.field_x_vertical_bar;
            countStatDef.outStatisticFieldName = self_ew.field_y_vertical_bar;

            query.orderByFields = ['COUNT(' + self_ew.field_x_vertical_bar + ') DESC'];

            query.outStatistics = [countStatDef];

            queryTask.execute(query, function (results) {
                x = results.features.map(function (i) {
                    return i.attributes[self_ew.field_x_vertical_bar];
                });
                y = results.features.map(function (i) {
                    return i.attributes[self_ew.field_y_vertical_bar];
                });
                self_ew._VerticalBarChart(x, y);
            });
        },
        _VerticalBarChart: function _VerticalBarChart(x, y) {
            var ctx = self_ew.VerticalBarAp.getContext('2d');
            ctx.canvas.height = 500;
            var myChart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: x,
                    datasets: [{
                        label: self_ew.label_y_vertical_bar,
                        data: y,
                        borderWidth: 0.1,
                        borderColor: '#eeeeee',
                        backgroundColor: '#36a2eb'
                    }]
                },
                options: {
                    responsive: true,
                    // maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                // beginAtZero: true,
                                fontColor: '#eeeeee'
                            },
                            gridLines: {
                                color: '#eeeeee',
                                lineWidth: 0.1
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                // beginAtZero: true,
                                fontColor: '#eeeeee'
                            },
                            gridLines: {
                                color: '#eeeeee',
                                lineWidth: 0.1
                            }
                        }]
                    },
                    plugins: {
                        labels: {
                            render: 'value',
                            fontColor: '#eeeeee'
                        }
                    },
                    onClick: self_ew._zoomToRegion
                }
            });
        },
        _drawPieChart: function _drawPieChart() {
            var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self_ew.iniClause;
            var process = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'initial';

            var url = this.feature_dc_tb.getUrl();

            var queryTask = new QueryTask(url);
            var query = new Query();

            query.where = where;
            query.groupByFieldsForStatistics = [self_ew.field_x_pie];

            var countStatDef = new StatisticDefinition();
            countStatDef.statisticType = "count";
            countStatDef.onStatisticField = self_ew.field_x_pie;
            countStatDef.outStatisticFieldName = self_ew.field_y_pie;

            query.outStatistics = [countStatDef];

            queryTask.execute(query, function (results) {
                x = results.features.map(function (i) {
                    return i.attributes[self_ew.field_x_pie];
                });
                y = results.features.map(function (i) {
                    return i.attributes[self_ew.field_y_pie];
                });
                if (process == 'initial') {
                    self_ew._pieChart(x, y);
                } else if (process == 'update') {
                    self_ew._updatePieChart(x, y);
                }
            });
        },
        _pieChart: function _pieChart(x, y) {
            var ctx = self_ew.PieAp.getContext('2d');
            ctx.canvas.height = 250;
            self_ew.chart_tipo_persona = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: x,
                    datasets: [{
                        label: self_ew.label_y_pie,
                        data: y,
                        backgroundColor: ['#07689f', '#68b0ab', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', '#fff48f'],
                        hoverOffset: 4
                    }]
                },
                // plugins: [ChartDataLabels],
                options: {
                    responsive: true,
                    // maintainAspectRatio: false,
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    legend: {
                        display: true,
                        labels: {
                            fontColor: '#eeeeee'
                        }
                    },
                    plugins: {
                        labels: {
                            render: 'value',
                            fontColor: '#eeeeee'
                        }
                    }
                }
            });
        },
        _updatePieChart: function _updatePieChart(x, y) {
            // self_ew.chart_tipo_persona.data.datasets.forEach((dataset) => {
            // dataset.data = y;
            // dataset.label = x;
            // });
            self_ew.chart_tipo_persona.data.labels = x;
            self_ew.chart_tipo_persona.data.datasets[0].data = y;
            self_ew.chart_tipo_persona.update();
        },
        _drawHorizontalBarChart: function _drawHorizontalBarChart() {
            var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self_ew.iniClause;
            var process = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'initial';

            var url = this.feature_dc_tb.getUrl();

            var queryTask = new QueryTask(url);
            var query = new Query();

            query.where = where;
            query.groupByFieldsForStatistics = [self_ew.field_x_horizontal_bar];

            var countStatDef = new StatisticDefinition();
            countStatDef.statisticType = "count";
            countStatDef.onStatisticField = self_ew.field_x_horizontal_bar;
            countStatDef.outStatisticFieldName = self_ew.field_y_horizontal_bar;

            query.outStatistics = [countStatDef];

            queryTask.execute(query, function (results) {
                var x = results.features.map(function (i) {
                    return i.attributes[self_ew.field_x_horizontal_bar];
                });
                for (var index = 0; index < x.length; index++) {
                    if (x[index] == 'SUNAT2') {
                        x[index] = 'SUNAT 2020';
                    } else if (x[index] == 'SUNAT') {
                        x[index] = 'SUNAT 2017';
                    } else {}
                }
                var y = results.features.map(function (i) {
                    return i.attributes[self_ew.field_y_horizontal_bar];
                });
                if (process == 'initial') {
                    self_ew._HorizontalBarChart(x, y);
                } else if (process == 'update') {
                    self_ew._updateHorizontalBarChart(x, y);
                }
            });
        },
        _HorizontalBarChart: function _HorizontalBarChart(x, y) {
            var ctx = self_ew.HorizontalBarAp.getContext('2d');
            ctx.canvas.height = 250;
            self_ew.chart_tipo_origen = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: x,
                    datasets: [{
                        label: self_ew.label_y_horizontal_bar,
                        data: y,
                        borderWidth: 0.1,
                        borderColor: '#eeeeee',
                        backgroundColor: ['#00d1b2', 'rgb(255, 99, 132)', 'rgb(255, 205, 86)', '#fff48f']
                        // borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    // maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                // beginAtZero: true,
                                fontColor: '#eeeeee'
                            },
                            gridLines: {
                                color: '#eeeeee',
                                lineWidth: 0.1
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                // beginAtZero: true,
                                fontColor: '#eeeeee'
                            },
                            gridLines: {
                                color: '#eeeeee',
                                lineWidth: 0.1
                            }
                        }]
                    },
                    plugins: {
                        labels: {
                            render: 'value',
                            fontColor: '#eeeeee'
                        }
                    }
                }
            });
        },
        _updateHorizontalBarChart: function _updateHorizontalBarChart(x, y) {
            self_ew.chart_tipo_origen.data.labels = x;
            self_ew.chart_tipo_origen.data.datasets[0].data = y;
            self_ew.chart_tipo_origen.update();
        },
        _acordeonFunction: function _acordeonFunction(evt) {
            var panel = evt.target.nextElementSibling;
            if (!panel) {
                panel = evt.target.parentElement.nextElementSibling;
                evt.target.parentElement.classList.toggle("active");
            }
            evt.target.classList.toggle("active");
            panel.classList.toggle("active");

            // if (panel.style.maxHeight) {
            //     panel.style.maxHeight = null;
            // } else {
            //     panel.style.maxHeight = panel.scrollHeight + "px";
            // }
        },
        startup: function startup() {
            this.inherited(arguments);
            this.feature_dc = this.layersMap.getLayerInfoById(this.config.layer_id_dc);
            this.feature_dc_tb = this.layersMap.getTableInfoById(this.config.service_id_horizontal_bar);
            this.feature_dc_tb_url = this.feature_dc_tb.getUrl();
            this.feature_dep = this.layersMap.getLayerInfoById(this.config.layer_id_dep);
            this._indicatorReinfo();
            this._drawVerticalBarChart();
            this._drawPieChart();
            this._drawHorizontalBarChart();
            // console.log('Estadisticas_wgt::startup');
        },
        onOpen: function onOpen() {
            console.log('Estadisticas_wgt::onOpen');
            this._configureStylePanelWidget();
            // this.panel = this.getPanel();
            // if (this.ownerDocumentBody.clientWidth > 1270) {
            //     this.panel.position.width = 720
            // } else {
            //     this.panel.position.width = 360
            // }
            // this.panel.setPosition(this.panel.position);
            // this.panel.panelManager.normalizePanel(this.panel);
        },
        onClose: function onClose() {
            console.log('Estadisticas_wgt::onClose');
            this._configureStylePanelWidget(create = false);
        }
    }
    // _resizeController() {
    //     this.panel = this.getPanel();
    //     this.panel.position.width = screen.width > 1270 ? 720 : 320;
    //     this.panel.setPosition(this.panel.position);
    //     this.panel.panelManager.normalizePanel(this.panel);
    // },
    // onMinimize(){
    //   console.log('Estadisticas_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Estadisticas_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Estadisticas_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Estadisticas_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Estadisticas_wgt::onPositionChange');
    // },
    // resize() {
    //     console.log('Estadisticas_wgt::resize');
    //     // this._resizeController()
    // }
    );
});
//# sourceMappingURL=Widget.js.map
