import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Class } from '../../../core/models/class.model';
import { ClassService } from '../../../core/services/class.service';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatRadioModule, MatSnackBarModule
  ],
  templateUrl: './class-form.component.html',
  styleUrl: './class-form.component.scss'
})
export class ClassFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ClassService);
  private dialogRef = inject(MatDialogRef<ClassFormComponent>);
  private snackBar = inject(MatSnackBar);
  data: Class | null = inject(MAT_DIALOG_DATA, { optional: true });

  isEdit = false;
  saving = false;

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    isActive:    [true, Validators.required],
    startDate:   ['', Validators.required],
    endDate:     ['', Validators.required]
  });

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        name:        this.data.name,
        description: this.data.description ?? '',
        isActive:    this.data.isActive,
        startDate:   this.data.startDate.substring(0, 10),
        endDate:     this.data.endDate.substring(0, 10)
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value as Omit<Class, 'id'>;

    const req$ = this.isEdit
      ? this.svc.update(this.data!.id, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to save class', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
