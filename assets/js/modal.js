// Initialise Vue instance
const vm = new Vue({
  el: '#modal',
  vuetify: vuetify,

  /////////////////////////////////////////////////////////////////////////////
  // Data
  /////////////////////////////////////////////////////////////////////////////

  data: {
    updatingAddress: false,
    addressInfo: '123 Test Road, 12345, London, UK',

    sharedData: {},
    ticketId: 0,
    firstLoad: true
  },

  /////////////////////////////////////////////////////////////////////////////
  // Computed
  /////////////////////////////////////////////////////////////////////////////

  computed: {
    // ...
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods
  /////////////////////////////////////////////////////////////////////////////

  methods: {
    // Load app initial data
    loadInitialData: function () {
      const urlParams = new URLSearchParams(window.location.search)

      const exports = JSON.parse(urlParams.get('exports'))

      for (const key in exports) {
        this[key] = exports[key]
      }

      this.syncWithParent()
    },

    // Toggle app loader
    // Usage example: toggleLoader({ active: true, opacity: 1 })
    // Optional: opacity
    toggleLoader: function (args) {
      const active = args && args.active
      const opacity = args && args.opacity

      this.loader = {
        active: active,
        opacity: opacity || 0.7
      }
    },

    // Request data from parent
    syncWithParent: async function () {
      const instances = Object.values((await client.get('instances')).instances)
      const parentId = instances.find(
        (obj) => obj.location === 'ticket_sidebar' && obj.ticketId === this.ticketId
      ).instanceGuid

      await client.instance(parentId).trigger('request_data')
    },

    // Update parent shared data
    updateParent: async function () {
      const instances = Object.values((await client.get('instances')).instances)
      const parentId = instances.find(
        (obj) => obj.location === 'ticket_sidebar' && obj.ticketId === this.ticketId
      ).instanceGuid

      client.instance(parentId).trigger('update_app', this.sharedData)
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Created
  /////////////////////////////////////////////////////////////////////////////

  created: function () {
    // Update modal data when parent sends an update
    client.on(
      'update_app',
      function (data) {
        this.sharedData = data
        this.firstLoad = false
      }.bind(this)
    )

    // Load initial app data
    this.loadInitialData()
  },

  /////////////////////////////////////////////////////////////////////////////
  // Watch
  /////////////////////////////////////////////////////////////////////////////

  watch: {
    sharedData: {
      handler: function () {
        if (!this.firstLoad) {
          this.updateParent()
        }
      },
      deep: true
    }
  }
})
