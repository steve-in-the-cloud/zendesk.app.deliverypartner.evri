// Initialise Apps framework client. See also:
// https://developer.zendesk.com/apps/docs/developer-guide/getting_started
const client = ZAFClient.init()

// Vuetify settings
const vuetify = new Vuetify({
  icons: {
    iconfont: 'fa'
  },
  theme: {
    themes: {
      light: {
        primary: '#3A71B2',
        secondary: '#424242'
      }
    }
  }
})

// Resize app based on the app container height
// Usage example: resizeApp({ maxHeight: 350 })
// Optional parameter: maxHeight (Integer)
function resizeApp(params) {
  const maxHeight = params && params.maxHeight

  const appContainer = document.querySelector('#app .app-container')
  const appHeight =
    !maxHeight || (appContainer && appContainer.offsetHeight <= maxHeight)
      ? appContainer.offsetHeight
      : maxHeight + 'px'

  if (appContainer) {
    client.invoke('resize', { width: '100%', height: appHeight })
  }
}

// Fetch ticket info
async function fetchTicketInfo() {
  const ticket = (await client.get('ticket')).ticket

  return ticket
}
