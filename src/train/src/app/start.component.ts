import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BegrippenService } from './begrippen.service';

@Component({
  standalone: true,
  selector: 'app-start',
  imports: [CommonModule, RouterModule],
  templateUrl: './start.component.html'
})
export class StartComponent {
  keys: string[] = [];

  constructor(private svc: BegrippenService, private router: Router) {
    this.load();
  }

  async load() {
    const count = await this.svc.count();
    // build keys by fetching successive entries
    const tmp: string[] = [];
    for (let i = 0; i < count; i++) {
      const item = await this.svc.getByIndex(i);
      if (item) tmp.push(item.key);
    }
    this.keys = tmp;
  }

  start() {
    this.router.navigate(['/begrip', 0]);
  }
}
