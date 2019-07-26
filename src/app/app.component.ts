import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { AngularFireDatabase } from 'angularfire2/database';

import { AuthService } from 'src/app/auth-service/auth.service';
import * as config from '../../auth_config.json';
import { CustomHeaders, Video } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  profile: any;
  fileToUpload: File = null;

  isUploadDone = false;

  isUploading = false;

  percentDone = 0;

  videos = [];
  oldVideos = [];

  /**
   * Constructor - inject the AuthService class
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private db: AngularFireDatabase) { }

  /**
   * Handle component initialization
   */
  async ngOnInit() {
    // Get an instance of the Auth0 client
    await this.authService.getAuth0Client();

    this.db.list('videos').valueChanges().subscribe(
      data => {
        this.videos = data;
      },
      () => this.videos = []
    );

    // Watch for changes to the isAuthenticated state
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });

    // Watch for changes to the profile data
    this.authService.profile.subscribe(profile => {
      this.profile = profile;
    });
  }

  /**
   * Logs in the user by redirecting to Auth0 for authentication
   */
  login(): void {
    this.authService.login();
  }

  getUserProfile(): void {
    this.http.get(config.api_base_url + '/user-profile?accessToken=' + this.authService.accessToken, this.setHeaders())
      .subscribe(
        data => {
          return data;
        },
        () => {
          console.log('');
        });
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);
    const requestDocumentUrl = `${config.api_base_url}/s3-upload-link?filename=${encodeURI(this.fileToUpload.name)}`;

    this.http.get(requestDocumentUrl, this.setHeaders())
      .subscribe(
        (data: any) => {
          const fd = new FormData();
          for (const key in data.fields) {
            if (data.fields.hasOwnProperty(key)) {
              const value = data.fields[key];
              fd.append(key, value);
            }
          }
          fd.append('acl', 'private');
          fd.append('file', this.fileToUpload);

          const req = new HttpRequest('POST', data.url, fd, {
            reportProgress: true,
          });
          this.http.request(req).subscribe(event => {
            // Via this API, you get access to the raw event stream.
            // Look for upload progress events.
            if (event.type === HttpEventType.UploadProgress) {
              this.isUploading = true;
              // This is an upload progress event. Compute and show the % done:
              this.percentDone = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              // File is completely uploaded!
              this.isUploading = true;
              this.isUploadDone = true;
            }
          }, () => this.isUploading = false
          );
        },
        () => {
          this.isUploading = false;
        }
      );
  }

  deleteVideo(video: Video) {
    this.http.get(`${config.api_base_url}/s3-delete-file?directoryName=${encodeURI(video.ref)}`, this.setHeaders())
      .subscribe(
        data => {
          console.log(data);
        },
        error => console.log(error)
      );
  }

  /**
   * Logs the user out of the applicaion, as well as on Auth0
   */
  logout(): void {
    this.authService.logout();
  }

  setHeaders(): CustomHeaders {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.accessToken}`
      }
    };
  }
}
