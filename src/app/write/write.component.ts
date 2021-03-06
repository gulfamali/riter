import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.scss']
})
export class WriteComponent implements OnInit {
  error = { show: 0, message: '' }
  storyRows: number = 8;
  user_id: string;
  token: string;

  story = { title: '', body: '' };
  postForm = FormGroup;

  postButtonMsg = 'Post Story';
  alertMessage = '';
  alertClass = '';


  constructor(private api: ApiService,  private cookieService: CookieService, private globals: Globals) {
      this.globals.setTitle( "Write Your Story" );
      this.globals.setActiveMenu( "write" );
      this.user_id = this.cookieService.get('userId');
      this.token = this.cookieService.get('token');
  }

  ngOnInit() {
  }

  post(){
      console.log(this.story);
      this.story.body = this.story.body.trim();
      if(this.story.body.length < 30)
      {
        return false;
      }
      this.postButtonMsg = "Posting your story...";
      var data = { title: this.story.title, body: this.story.body}
      this.api.writeStory(data).subscribe(res => {
          if(res['validate']=="true")
          {
            this.alertMessage = "Story has been successfully posted. Please wait...";
            this.alertClass = "alert alert-success";
            window.location.href = "feed/"+res['post_id'];
          }else{
            this.error.message = "Something went wrong while posting your story. Please try again.";
            this.error.show = 1;
          }
       });

  }

  expandArea(){

      if(this.story.body.split(/\r\n|\r|\n/).length > 7)
      {
        this.storyRows = (this.story.body.split(/\r\n|\r|\n/).length) +1;
      }else{
        this.storyRows = 8;
      }
  }

}
