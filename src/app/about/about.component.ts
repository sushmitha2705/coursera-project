import { Component, OnInit ,Inject} from '@angular/core';
import { Leader } from '../shared/leader';
import { LEADERS } from '../shared/leaders';
import { flyInOut,expand } from '../animations/app.animation';
import { LeaderService } from '../services/leader.service';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class AboutComponent implements OnInit {
  leaderErrMess : string;
leaders: Leader[];
constructor(private leaderservice: LeaderService,@Inject('baseURL') private baseURL) { }

  ngOnInit() {
   // this.leaderservice.getLeaders().subscribe(leaders => this.leaders=leaders);
    this.leaderservice.getLeaders().subscribe(leaders => this.leaders=leaders,errmess => this.leaderErrMess = <any>errmess);
  }

  
}
