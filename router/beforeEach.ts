import {Route} from 'vue-router'
import rootStore from '@vue-storefront/core/store'
import config from 'config'
import {storeCodeFromRoute} from '@vue-storefront/core/lib/multistore'
import axios from 'axios'

export function beforeEach(to: Route, from: Route, next) {

  const cartToken: string = rootStore.state.cart.cartServerToken;
  const userToken: string = rootStore.state.user.token;
  const externalCheckoutConfig = {...config.externalCheckout};
  const cmsUrl: string = externalCheckoutConfig.cmsUrl;
  const cmsCartSyncUrl: string = externalCheckoutConfig.cmsCartSyncUrl;
  const magentoOrderEndpoint: string = externalCheckoutConfig.magentoOrderEndpoint;
  const postRequestEnabled: boolean = externalCheckoutConfig.usePostRequest;
  const stores = externalCheckoutConfig.stores;
  const storeCode = storeCodeFromRoute(to);
  const multistoreEnabled: boolean = config.storeViews.multistore;

  let cartData = rootStore.state.cart;

  if (multistoreEnabled) {
    if (storeCode in stores && to.name === storeCode + '-checkout') {
      syncCart(stores[storeCode].cmsUrl + '/vue/cart/sync/token/' + userToken + '/cart/' + cartToken)
    } else {
      next()
    }
  } else {
    if (to.name === 'checkout') {
      syncCart(cmsUrl + '/vue/cart/sync/token/' + userToken + '/cart/' + cartToken)
    } else {
      next()
    }
  }

  function syncCart(redirectUrl) {
    if (postRequestEnabled) {
      axios.post(magentoOrderEndpoint, {'cartData': cartData, 'cmsCartSyncUrl': cmsCartSyncUrl})
        .then(function (response) {
          window.location.replace(redirectUrl)
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        });
    }
  }
}
