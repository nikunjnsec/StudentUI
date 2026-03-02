import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
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
    MatTableModule, MatButtonModule, MatIconModule,
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

  students = signal<Student[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  displayedColumns = ['actions', 'firstName', 'lastName', 'email', 'phoneNumber', 'enrolledAt'];

  filteredStudents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.students();
    return this.students().filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phoneNumber ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => { this.students.set(data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      }
    });
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
