import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  navLinks = [
    { path: '/bmi', label: 'BMI Calc' },
    { path: '/todo', label: 'Todo List' },
    { path: '/students', label: 'Students' }
  ];
}