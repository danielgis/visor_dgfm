define(['dojo/_base/declare', 'jimu/BaseWidget'], function (declare, BaseWidget) {
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'presentacion-wgt',

    postCreate: function postCreate() {
      this.inherited(arguments);
      console.log('presentacion_wgt::postCreate');
    }
  }
  // startup() {
  //   this.inherited(arguments);
  //   console.log('presentacion_wgt::startup');
  // },
  // onOpen() {
  //   console.log('presentacion_wgt::onOpen');
  // },
  // onClose(){
  //   console.log('presentacion_wgt::onClose');
  // },
  // onMinimize(){
  //   console.log('presentacion_wgt::onMinimize');
  // },
  // onMaximize(){
  //   console.log('presentacion_wgt::onMaximize');
  // },
  // onSignIn(credential){
  //   console.log('presentacion_wgt::onSignIn', credential);
  // },
  // onSignOut(){
  //   console.log('presentacion_wgt::onSignOut');
  // }
  // onPositionChange(){
  //   console.log('presentacion_wgt::onPositionChange');
  // },
  // resize(){
  //   console.log('presentacion_wgt::resize');
  // }
  );
});
//# sourceMappingURL=Widget.js.map
