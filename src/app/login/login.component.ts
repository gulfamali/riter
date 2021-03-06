import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '../api.service';
import { Globals } from '../globals';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user = { email: '', password: '' };
  loginForm = FormGroup;

  loginButtonMsg = 'Login';
  alertMessage = '';
  alertClass = '';

  constructor(private cookieService: CookieService, private api: ApiService, private globals: Globals) {
      this.globals.setTitle( "Login | Wordsire" );
      this.globals.setActiveMenu('login');
  }
  ngOnInit() {
  }

  handleApiError(error: any){
    this.loginButtonMsg = 'Login';
    if(error.status == 0)
    {
      console.log('No Internet Connection');
      this.alertClass = "alert alert-warning";
      this.alertMessage = "No Internet Connection!";
    }
  }

  login(){
    this.loginButtonMsg = 'Logging you in...';
    this.api.login(this.user).subscribe(res => {
          if(res['validate']=="true")
          {
              this.alertMessage = res['message'];
              this.alertClass = "alert alert-success";

              this.cookieService.set( 'userId', res['user_id'] );
              this.cookieService.set( 'username', res['username'] );
              this.cookieService.set( 'firstName', res['first_name'] );
              this.cookieService.set( 'lastName', res['last_name'] );
              this.cookieService.set( 'email', res['email'] );
              this.cookieService.set( 'token', res['user_token'] );
              this.globals.hideLoad();
              location.reload();
          }else{
            this.loginButtonMsg = 'Login';
            this.alertMessage = res['message'];
            this.alertClass = "alert alert-danger";
          }
     },
    error =>{
      this.handleApiError(error);
    });
  }

}
