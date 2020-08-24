import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {CommentService} from '../../services/comment.service';
import {GLOBAL} from '../../services/global';
import {PublicationService} from '../../services/publication.service';
import * as $ from 'jquery';

@Component({
  selector: 'publicationdetail',
  templateUrl: './publicationdetail.component.html',
  providers: [UserService, PublicationService,CommentService]
})
//this is component to display publication detail.
export class PublicationdetailComponent implements OnInit {
  public identity;
  public token;
  public title: string;
  public url: string;
  public status: string;
  public page;
  public total;
  public pages;
  public publication;
  public publication_id: string;
  public commentFlag:boolean =false;
  public commentButtonShowFlag:boolean=false;
  public comment:string;
  public commentObjects:[];
  public success;
  public message : string;
  constructor(
    private _route: ActivatedRoute,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _commentService:CommentService,
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit() {
    const id = this._route.snapshot.paramMap.get('id');
    this.publication_id = id;
    this.getPublication(this.publication_id);
    this.getComments();
    this.title = 'Publicaciones detalle';
    this.url=GLOBAL.url;
    this.commentFlag=false;

    this.token = this._userService.getToken();
  }

  //obtener la publicación del backend por id
  getPublication(publication_id) {
    this._publicationService.getPublication(this.token, publication_id).subscribe(
      response => {
        this.publication = response;
      }
    );
  }

  //obtener comentarios del backend
  getComments() {
    this._commentService.getComments(this.token, {publication: this.publication_id}).subscribe(
      response => {
        this.commentObjects = response;
        this.checkCommentButtonShowFlag(response);
      }
    );
  }
  //si ya he dejado comentario sobre esta publicación
  //No mostraré el botón dejar comentario.
  //tampoco puedo dejar comentarios sobre mi publicación
  checkCommentButtonShowFlag(commentObjects){
    if (this.publication){
      if (this.publication.user._id==this.identity._id) {
        console.log("same1?")
        this.commentButtonShowFlag = false;
        return;
      }
      else{
        for (let i in commentObjects){
          console.log("same2?")
          commentObjects[i].emitter._id==this.identity._id
          this.commentButtonShowFlag=false;
          return;
        }
      }
      this.commentButtonShowFlag=true;
    }
  }
  //agregar comentario al backend
  addComment(){
    this.commentFlag=!this.commentFlag;
    const emitter = this.identity._id;
    const comment = this.comment;
    const publication = this.publication._id;
    this.comment="";
    this._commentService.addComment(this.token,{emitter,comment,publication}).subscribe(
      response => {
        this.commentButtonShowFlag=false;
        // guardar el comentario es un error o un éxito?
        this.success = response.success;
        // guardar el comentario es un error o un éxito?
        this.message = response.message;
        setTimeout(()=>{
          this.success=null;
        },1500)
        this.getComments();
      }
    );
  }
  //si hago clic en el botón comentar, mostraré la entrada del área de texto y el botón guardar y cancelar
  commentButtonClick(){
    $("html, body").animate({scrollTop: $('body').prop("scrollHeight")}, 500);
    this.commentFlag=!this.commentFlag;
  }
}
