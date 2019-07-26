import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { BehaviorSubject } from 'rxjs';
import createAuth0Client from '@auth0/auth0-spa-js';
import { Injectable } from '@angular/core';

import * as config from '../../../auth_config.json';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = new BehaviorSubject(false);
  profile = new BehaviorSubject<any>(null);

  accessToken: string;
  idToken: string;

  private auth0Client: Auth0Client;

  // Auth0 application configuration
  config = config;

  /**
   * Gets the Auth0Client instance.
   */
  async getAuth0Client() {

    if (!this.auth0Client) {
      this.auth0Client = await createAuth0Client({
        domain: config.auth0.domain,
        client_id: config.auth0.client_id,
        audience: config.auth0.audience,
        redirect_uri: `${window.location.origin}/callback`,
        scope: 'openid profile email user_metadata picture read:rules'
      });

      // Provide the current value of isAuthenticated
      this.isAuthenticated.next(await this.auth0Client.isAuthenticated());

      this.auth0Client.getTokenSilently({
        audience: config.auth0.audience,
        scope: 'read:rules'
      })
        .then(accessToken => this.accessToken = accessToken)
        .catch();

      // Whenever isAuthenticated changes, provide the current value of `getUser`
      this.isAuthenticated.subscribe(async isAuthenticated => {
        if (isAuthenticated) {
          this.profile.next(await this.auth0Client.getUser());
          return;
        }

        this.profile.next(null);
      });
    }
    return this.auth0Client;
  }

  login() {
    this.auth0Client.loginWithRedirect({});
  }

  logout() {
    this.auth0Client.logout({
      client_id: config.auth0.client_id,
      returnTo: window.location.origin
    });
  }
}
