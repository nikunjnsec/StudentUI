import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from '../../../core/models/subject.model';
import { Class } from '../../../core/models/class.model';
import { SubjectService } from '../../../core/services/subject.service';

export interface SubjectFormData {
  subject: Subject | null;
  classes: Class[];
}

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.scss'
})
export class SubjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(SubjectService);
  private dialogRef = inject(MatDialogRef<SubjectFormComponent>);
  private snackBar = inject(MatSnackBar);
  data: SubjectFormData = inject(MAT_DIALOG_DATA);

  isEdit = false;
  saving = false;

  /** Classes available in the dropdown:
   *  For Add: only classes that don't already have a subject (no classId collision).
   *  For Edit: same filtered list + the currently assigned class. */
  availableClasses: Class[] = [];

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    classId:     [null as number | null, Validators.required]
  });

  ngOnInit() {
    if (this.data.subject) {
      this.isEdit = true;
      // For edit: show all classes (API enforces uniqueness; current class is already valid)
      this.availableClasses = this.data.classes;
      this.form.patchValue({
        name:        this.data.subject.name,
        description: this.data.subject.description ?? '',
        classId:     this.data.subject.classId
      });
    } else {
      // For add: only show classes that don't already have a subject
      // We can't know from here which classes have subjects without querying,
      // but the parent passed all classes. We rely on the API's unique constraint
      // and simply show all classes. A Conflict error will surface as a snackbar.
      this.availableClasses = this.data.classes;
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    const { name, description, classId } = this.form.value;
    const payload: Omit<Subject, 'id'> = {
      name: name!,
      description: description || null,
      classId: classId!
    };

    const req$ = this.isEdit
      ? this.svc.update(this.data.subject!.id, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.saving = false;
        const msg = err.status === 409
          ? 'This class already has a subject assigned'
          : 'Failed to save subject';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
