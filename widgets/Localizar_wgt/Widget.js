define(['dojo/_base/declare', 'jimu/BaseWidget'], function (declare, BaseWidget) {
    return declare([BaseWidget], {

        // Custom widget code goes here

        baseClass: 'localizar-wgt',
        tabSelected: '',

        postCreate: function postCreate() {
            this.inherited(arguments);
            console.log('Localizar_wgt::postCreate');
            self_lw = this;
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
        startup: function startup() {
            this.inherited(arguments);
            console.log('Localizar_wgt::startup');
            dojo.query('.opcion_lw').on('click', this._tabToggleForm);
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
