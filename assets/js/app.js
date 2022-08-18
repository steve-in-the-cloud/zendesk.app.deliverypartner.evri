// Initialise Vue instance
const vm = new Vue({
  el: '#app',
  vuetify: vuetify,

  /////////////////////////////////////////////////////////////////////////////
  // Data
  /////////////////////////////////////////////////////////////////////////////

  data: {
    sharedData: {
      ticket: {}
    },

    firstLoad: true,
    defaultAvatar: 'https://i2.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png'
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
    // Open modal window
    openModal: async function () {
      const exports = {
        ticketId: this.sharedData.ticket.id
      }

      await client.invoke('instances.create', {
        location: 'modal',
        url: `assets/modal.html?exports=${encodeURIComponent(JSON.stringify(exports))}`,
        size: {
          width: '80vw',
          height: '60vh'
        }
      })
    },

    // Load app initial data
    loadInitialData: async function (args) {
      try {
        const opacity = args && args.opacity

        this.toggleLoader({ active: true, opacity: opacity || 1 })

        this.sharedData.ticket = await fetchTicketInfo()
      } catch (err) {
        client.invoke('notify', err, 'error', {
          sticky: true
        })
      } finally {
        this.toggleLoader({ active: false })
        this.firstLoad = false
      }
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

    // Update modal shared data
    updateModal: async function () {
      const instances = Object.values((await client.get('instances')).instances)
      const modal = instances.find((obj) => obj.location === 'modal')

      if (modal) {
        const modalId = modal.instanceGuid
        client.instance(modalId).trigger('update_app', this.sharedData)
      }
    }
  },

  /////////////////////////////////////////////////////////////////////////////
  // Mounted
  /////////////////////////////////////////////////////////////////////////////

  mounted: function () {
    // Observe when the app container changes its size, then resize the app
    const appContainerObserver = new MutationObserver(
      function () {
        const appContainer = document.querySelector('#app .app-container')

        if (document.contains(appContainer) && !this.loader.active) {
          new ResizeObserver(resizeApp).observe(appContainer)
          appContainerObserver.disconnect()
        }
      }.bind(this)
    )

    appContainerObserver.observe(document, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true
    })
  },

  /////////////////////////////////////////////////////////////////////////////
  // Created
  /////////////////////////////////////////////////////////////////////////////

  created: function () {
    // Send data back to the modal window when triggered
    client.on(
      'request_data',
      function () {
        this.updateModal()
      }.bind(this)
    )

    // Update app data when modal sends an update
    client.on(
      'update_app',
      function (data) {
        this.sharedData = data
      }.bind(this)
    )

    // Load initial app data
    this.loadInitialData()
  }
})
