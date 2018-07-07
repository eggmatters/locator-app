function Events() {
   /**
    * handlers for an event
    *
    * @var {object}
    */
   this.stack = {};
}

Events.prototype = {
   stack: null,

   constructor: Events,
   /**
   * on function.
   * adds a callback to an event stack
   *
   * @param {string} event       the event to subscribe to
   * @param {function} callback  the event callback to subscribe
   *
   * @return void
     */
   on: function (event, callback) {
      // if there is no callback registered for this event yet,
      // create an array for this event
      if (!this.stack.hasOwnProperty(event)) {
         this.stack[event] = [];
      }

      // push the event callback to the handler stack
      this.stack[event].push(callback);
   },
    /**
    * off function.
    * removes a callback from an event stack
    *
    * @param {string} event       the event to unsubscribe from
    * @param {function} callback  the event callback to unsubscribe
    *
    * @return {bool}              whether the callback was removed or not
    */
   off: function (event, callback)
   {
      // if the event does not exist, return false
      if (!event in this.stack) {
         return false;
      }

      // iterate over handlers, remove the callback in question
      this.stack[event] = this.stack[event].filter(
         function (item) {
            if (item !== callback) {
               return item;
            }
         }
      );

      return true;
   },
   /**
    * trigger function.
    * calls all registered callbacks for an event
    *
    * @param {string} event the event to trigger callbacks for
    * @param {mixed} data        optional data to hand over to the callbacks
    *
    * @return {bool}             whether the event has been fired
    */
   trigger: function (event, data) {
      // use an empty object if no data given
      var data = (typeof data === 'undefined') ? {} : data;

      // the event does not exist.
      if (!this.stack.hasOwnProperty(event)) {
         return false;
      }

      // iterate over all callbacks, run them as expected
      for (var i = 0; i < this.stack[event].length; i++) {

         // @TODO: the scope should maybe be modifyable, even though
         //        this would require to specify a scope parameter
         //        for every event trigger...
         this.stack[event][i].call(window, event, data);
      }

      return true;
   }
};