import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Class } from '../../../core/models/class.model';
import { Student } from '../../../core/models/student.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-enrollment-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule, MatListModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './enrollment-dialog.component.html',
  styleUrl: './enrollment-dialog.component.scss'
})
export class EnrollmentDialogComponent implements OnInit {
  enrolledStudents: Student[] = [];
  availableStudents: Student[] = [];
  allStudents: Student[] = [];
  selectedStudentId: number | null = null;
  loading = false;
  loadError = false;
  errorDetail = '';
  enrolling = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public cls: Class,
    private enrollmentSvc: EnrollmentService,
    private studentSvc: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = false;
    this.errorDetail = '';
    this.cdr.markForCheck();

    // Step 1: load all students
    this.studentSvc.getAll().subscribe({
      next: (all) => {
        this.allStudents = all;
        // Step 2: load enrolled students for this class
        this.enrollmentSvc.getStudentsByClass(this.cls.id).subscribe({
          next: (enrolled) => {
            this.enrolledStudents = enrolled;
            const enrolledIds = new Set(enrolled.map(s => s.id));
            this.availableStudents = this.allStudents.filter(s => !enrolledIds.has(s.id));
            this.selectedStudentId = null;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.errorDetail = `Enrollment fetch failed — status ${err?.status ?? '?'}: ${err?.message ?? err}`;
            this.loading = false;
            this.loadError = true;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.errorDetail = `Student fetch failed — status ${err?.status ?? '?'}: ${err?.message ?? err}`;
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      }
    });
  }

  enroll() {
    if (!this.selectedStudentId) return;
    this.enrolling = true;
    this.enrollmentSvc.enroll(this.selectedStudentId, this.cls.id).subscribe({
      next: () => { this.enrolling = false; this.load(); },
      error: () => { this.enrolling = false; this.cdr.markForCheck(); }
    });
  }

  unenroll(student: Student) {
    this.enrollmentSvc.unenroll(student.id, this.cls.id).subscribe({
      next: () => this.load()
    });
  }

  fullName(s: Student) {
    return `${s.firstName} ${s.lastName}`;
  }
}
