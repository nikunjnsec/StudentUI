import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private auth = inject(AuthService);

  isMobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 767px)').pipe(map(r => r.matches)),
    { initialValue: false }
  );

  logout() {
    this.auth.logout();
  }
}
