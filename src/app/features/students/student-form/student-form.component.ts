import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';
import { StudentPhotoService } from '../../../core/services/student-photo.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(StudentService);
  private photoSvc = inject(StudentPhotoService);
  private dialogRef = inject(MatDialogRef<StudentFormComponent>);
  private snackBar = inject(MatSnackBar);
  data: Student | null = inject(MAT_DIALOG_DATA, { optional: true });

  isEdit = false;
  saving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;      // local preview of newly selected file
  existingPhotoUrl: string | null = null; // current photo from API (edit mode)

  form = this.fb.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    dateOfBirth: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    enrolledAt:  ['', Validators.required]
  });

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.existingPhotoUrl = this.photoSvc.getPhotoUrl(this.data.id);
      this.form.patchValue({
        firstName:   this.data.firstName,
        lastName:    this.data.lastName,
        email:       this.data.email,
        dateOfBirth: this.data.dateOfBirth.substring(0, 10),
        phoneNumber: this.data.phoneNumber,
        enrolledAt:  this.data.enrolledAt.substring(0, 10)
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value as Omit<Student, 'id'>;

    if (this.isEdit) {
      this.svc.update(this.data!.id, payload).subscribe({
        next: () => this.uploadPhotoThenClose(this.data!.id),
        error: () => {
          this.saving = false;
          this.snackBar.open('Failed to save student', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.svc.create(payload).subscribe({
        next: (created) => this.uploadPhotoThenClose(created.id),
        error: () => {
          this.saving = false;
          this.snackBar.open('Failed to save student', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private uploadPhotoThenClose(studentId: number) {
    if (this.selectedFile) {
      this.photoSvc.upload(studentId, this.selectedFile).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.dialogRef.close(true) // photo failed but student was saved
      });
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
