import { Component, ViewChild, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { StudentEnrollmentDialogComponent } from '../student-enrollment-dialog/student-enrollment-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit {
  private svc = inject(StudentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  searchQuery = signal('');
  displayedColumns = ['actions', 'name', 'email', 'phoneNumber', 'enrolledAt'];
  dataSource = new MatTableDataSource<Student>();

  // Setter handles paginator being inside @if block — called when element enters the DOM
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    this.dataSource.paginator = p;
  }

  ngOnInit() {
    // Only match firstName, lastName, email, phoneNumber — not id/dates
    this.dataSource.filterPredicate = (s, filter) =>
      s.firstName.toLowerCase().includes(filter) ||
      s.lastName.toLowerCase().includes(filter) ||
      s.email.toLowerCase().includes(filter) ||
      (s.phoneNumber ?? '').toLowerCase().includes(filter);

    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.dataSource.data = data; this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch(value: string) {
    this.searchQuery.set(value);
    this.dataSource.filter = value.trim().toLowerCase();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.dataSource.filter = '';
  }

  openAdd() {
    this.dialog.open(StudentFormComponent, { data: null })
      .afterClosed().subscribe(saved => { if (saved) this.loadStudents(); });
  }

  manageEnrollments(student: Student) {
    this.dialog.open(StudentEnrollmentDialogComponent, { data: student, width: '520px' });
  }

  openEdit(student: Student) {
    this.dialog.open(StudentFormComponent, { data: student })
      .afterClosed().subscribe(saved => { if (saved) this.loadStudents(); });
  }

  delete(student: Student) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
      },
      width: '360px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.svc.delete(student.id).subscribe({
        next: () => this.loadStudents(),
        error: () => this.snackBar.open('Failed to delete student', 'Close', { duration: 3000 })
      });
    });
  }
}
