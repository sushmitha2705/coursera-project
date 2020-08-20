import { Component, OnInit, Input ,ViewChild,Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Feedback, ContactType } from '../shared/feedback';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
  dishcopy: Dish;
  errMess: string;
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  feedbackForm: FormGroup;
  autoTicks = false;
  max = 5;
  min = 1;
  showTicks = true;
  step = 1;
  thumbLabel = true;
  tickInterval = 1;
  currDate: Date;

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }
  @ViewChild('fform',{static: true}) feedbackFormDirective;
    constructor(private dishservice: DishService,
        private route: ActivatedRoute,
        private location: Location,private fb: FormBuilder,@Inject('baseURL') private baseURL) {
          this.createForm();
         }
        ngOnInit() {
          console.log(this.feedbackForm.valid);
          this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
          this.route.params
              .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
              .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
                errmess => this.errMess = <any>errmess );
            
          }
          setPrevNext(dishId: string) {
            const index = this.dishIds.indexOf(dishId);
            this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
            this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
          }
          goBack(): void {
            this.location.back();
          }
          formErrors = {
            'author' : ''
          };
          validationMessages = {
            'author': {
              'required':      'Name is required.',
              'minlength':     'Name must be at least 2 characters long.',
              'maxlength':     'Name cannot be more than 25 characters long.'
            }
          };
          createForm() {
            this.feedbackForm = this.fb.group({
              author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
              rating: [1],
              comment: ['', Validators.required]
            });
            this.feedbackForm.valueChanges
              .subscribe(data => {
                this.currDate = new Date();
                this.onValueChanged(data);
              });
        
            this.onValueChanged();
          }
          onValueChanged(data?: any) {
            if (!this.feedbackForm) { return; }
            const form = this.feedbackForm;
            for (const field in this.formErrors) {
              if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                  const messages = this.validationMessages[field];
                  for (const key in control.errors) {
                    if (control.errors.hasOwnProperty(key)) {
                      this.formErrors[field] += messages[key] + ' ';
                    }
                  }
                }
              }
            }
          }
          onSubmission() {
            const { author, rating, comment } = this.feedbackForm.value;
            this.currDate = new Date();
            this.dish.comments.push({ author, rating, comment, date: this.currDate.toDateString()});
            this.dishcopy.comments.push(comment);
            // Added new comments to database
            this.dishservice.putDish(this.dishcopy)
              .subscribe(dish => {
                this.dish = dish; this.dishcopy = dish;
              },
              errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
            this.feedbackForm.reset();
          }
}
