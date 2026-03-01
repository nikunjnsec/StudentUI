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
import { Student } from '../../../core/models/student.model';
import { Class } from '../../../core/models/class.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ClassService } from '../../../core/services/class.service';

@Component({
  selector: 'app-student-enrollment-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule, MatListModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './student-enrollment-dialog.component.html',
  styleUrl: './student-enrollment-dialog.component.scss'
})
export class StudentEnrollmentDialogComponent implements OnInit {
  enrolledClasses: Class[] = [];
  availableClasses: Class[] = [];
  allClasses: Class[] = [];
  selectedClassId: number | null = null;
  loading = false;
  enrolling = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public student: Student,
    private enrollmentSvc: EnrollmentService,
    private classSvc: ClassService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.cdr.markForCheck();

    this.classSvc.getAll().subscribe({
      next: (all) => {
        this.allClasses = all;
        this.enrollmentSvc.getClassesByStudent(this.student.id).subscribe({
          next: (enrolled) => {
            this.enrolledClasses = enrolled;
            const enrolledIds = new Set(enrolled.map(c => c.id));
            this.availableClasses = this.allClasses.filter(c => !enrolledIds.has(c.id));
            this.selectedClassId = null;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => { this.loading = false; this.cdr.markForCheck(); }
        });
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  enroll() {
    if (!this.selectedClassId) return;
    this.enrolling = true;
    this.enrollmentSvc.enroll(this.student.id, this.selectedClassId).subscribe({
      next: () => { this.enrolling = false; this.load(); },
      error: () => { this.enrolling = false; this.cdr.markForCheck(); }
    });
  }

  unenroll(cls: Class) {
    this.enrollmentSvc.unenroll(this.student.id, cls.id).subscribe({
      next: () => this.load()
    });
  }

  fullName(s: Student) {
    return `${s.firstName} ${s.lastName}`;
  }
}
