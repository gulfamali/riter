import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss']
})
export class StoryComponent implements OnInit {
  storyRows: number = 1;
  comment = { postId: '', text: '' };
  commentForm = FormGroup;
  user_id: string;
  token: string;
  story_id: number;
  total_records: string[];
  validate: string[];
  posts = {
    avtar:"",
    body:"",
    comments: 0,
    first_name: "",
    last_name:"",
    id:"",
    is_deleted:"",
    liked: 0,
    bookmarked: 0,
    likes: 0,
    modified_date:"",
    post_date : "",
    title : "" ,
    user_id : "" ,
    views : 0,
    follow: 0
  };

  commentArr = [];
  comments_returned: number = 0;
  comments_offset: number = 0;
  loading_post = true;
  refresh_post = false;
  loadComments = "Load more comments";
  loadErrorMsg = "No Internet Connection";

  constructor(private api: ApiService,  private route: ActivatedRoute, private cookieService: CookieService, private globals: Globals) {
      this.globals.setTitle( "Story" );
      this.globals.setActiveMenu( "story" );
      this.user_id = this.cookieService.get('userId');
      this.token = this.cookieService.get('token');

      this.route.params.subscribe( params => {
          this.story_id = params.id;
      });
  }

  ngOnInit() {
      this.readStory();
  }

  readStory(){
    this.refresh_post = false;
    this.loading_post = true;
    var data = { post_id:this.story_id }
    this.api.readStory(data).subscribe(res => {
        this.loading_post = false;
        if(res['validate'] == 'true'){
          this.total_records = res['total_records'];
          this.posts = res['data'][0];
          this.comment.postId = this.posts.id;
          this.posts.follow = +res['data']['0']['follow'];

          this.globals.setTitle( this.posts.title );

          this.commentArr = res['comments']['commentsArr'];
          this.comments_returned = res['comments']['comments_returned'];
          this.comments_offset = 5;
        }else{
          this.handleApiError(res);
        }

     },
    error =>{
      this.handleApiError(error);
    });
  }

  handleApiError(error: any){
    this.loading_post = false;
    this.refresh_post = true;
    if(error.status == 0)
    {
      console.log('No Internet Connection');
      this.loadErrorMsg = "No Internet Connection";
    }else{
      this.loadErrorMsg = "Server is not responding at the moment. Please try again later.";
    }
  }

  bookmark(){
      this.posts.bookmarked = (this.posts.bookmarked==1)?0:1;
      var data = { post_id: this.posts.id }

      this.api.bookmarkStory(data).subscribe(res => {
          if(res['validate']!='true')
          {
              this.posts.bookmarked = (this.posts.bookmarked)?0:1;
          }
       });
  }

  toggleFollow(){
    this.posts.follow = (this.posts.follow)?0:1;
    var data = { member_id:this.posts.user_id }
    this.api.toggleFollow(data).subscribe(res => {
      console.log(res)
        if(res['validate']=='true'){
            console.log('Operation Success');
        }else{
          this.posts.follow = (this.posts.follow)?0:1;
        }
    });
  }

  togglePostLike(post_id){
    this.posts.liked = (this.posts.liked==1)?0:1;
    this.posts.likes = (this.posts.liked==1)? (Number(this.posts.likes)+1) : (Number(this.posts.likes)-1) ;

    var data = { post_id: post_id }
    this.api.toggleLike(data).subscribe(res => {
        if(res['validate']!='true')
        {
            this.posts.liked = (this.posts.liked)?0:1;
            this.posts.likes = (this.posts.liked==1)? (Number(this.posts.likes)+1) : (Number(this.posts.likes)-1) ;
        }
     });
  }

  postComment(){

      this.comment.text = this.comment.text.trim();
      if(this.comment.text.length < 1)
      {
        return false;
      }
      var data = { post_id: this.comment.postId, comment: this.comment.text }
      this.api.comment(data).subscribe(res => {
          if(res['validate']=='true')
          {
              this.comment.text = '';

              this.posts.comments++;
              this.comments_offset = 0;
              this.refreshComments();
          }
       });
  }

  refreshComments(){
    var data = { post_id: this.comment.postId, offset: this.comments_offset }
    this.api.loadComments(data).subscribe(res => {
        if(res['comments_returned'] > 0)
        {
            this.comments_offset = this.comments_offset+5;
            this.commentArr = res['commentsArr'];
        }else{

        }
     });
  }

  loadMoreComments(){
    this.loadComments = "Loading...";
    var data = { post_id: this.comment.postId, offset: this.comments_offset }
    this.api.loadComments(data).subscribe(res => {
      this.loadComments = "Load more comments";
        if(res['comments_returned'] > 0)
        {
            this.comments_offset = this.comments_offset+5;

            for(let arr of res['commentsArr']){
                this.commentArr.push(arr);
            }

            console.log(this.commentArr)
        }else{

        }
     });
  }

  expandArea($event){

      if(this.comment.text.split(/\r\n|\r|\n/).length > 1)
      {
        this.storyRows = (this.comment.text.split(/\r\n|\r|\n/).length);
      }else{
        this.storyRows = 1;
      }
  }

}
