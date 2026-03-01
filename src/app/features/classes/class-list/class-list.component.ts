import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Class } from '../../../core/models/class.model';
import { ClassService } from '../../../core/services/class.service';
import { ClassFormComponent } from '../class-form/class-form.component';
import { EnrollmentDialogComponent } from '../enrollment-dialog/enrollment-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit {
  private svc = inject(ClassService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  classes = signal<Class[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'description', 'startDate', 'endDate', 'actions'];

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.classes.set(data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
      }
    });
  }

  openAdd() {
    this.dialog.open(ClassFormComponent, { data: null })
      .afterClosed().subscribe(saved => { if (saved) this.loadClasses(); });
  }

  openEdit(cls: Class) {
    this.dialog.open(ClassFormComponent, { data: cls })
      .afterClosed().subscribe(saved => { if (saved) this.loadClasses(); });
  }

  manageEnrollments(cls: Class) {
    this.dialog.open(EnrollmentDialogComponent, { data: cls, width: '520px' });
  }

  delete(cls: Class) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Class',
        message: `Are you sure you want to delete "${cls.name}"?`
      },
      width: '360px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.svc.delete(cls.id).subscribe({
        next: () => this.loadClasses(),
        error: () => this.snackBar.open('Failed to delete class', 'Close', { duration: 3000 })
      });
    });
  }
}
