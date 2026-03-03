import { Component, ViewChild, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { Subject } from '../../../core/models/subject.model';
import { Class } from '../../../core/models/class.model';
import { SubjectService } from '../../../core/services/subject.service';
import { ClassService } from '../../../core/services/class.service';
import { SubjectFormComponent } from '../subject-form/subject-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

export interface SubjectRow extends Subject {
  className: string;
}

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.scss'
})
export class SubjectListComponent implements OnInit {
  private svc = inject(SubjectService);
  private classSvc = inject(ClassService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  classes = signal<Class[]>([]);
  loading = signal(false);
  displayedColumns = ['actions', 'name', 'description', 'className'];
  dataSource = new MatTableDataSource<SubjectRow>();

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    this.dataSource.paginator = p;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    forkJoin({
      subjects: this.svc.getAll(),
      classes: this.classSvc.getAll()
    }).subscribe({
      next: ({ subjects, classes }) => {
        this.classes.set(classes);
        const classMap = new Map(classes.map(c => [c.id, c.name]));
        this.dataSource.data = subjects.map(s => ({
          ...s,
          className: classMap.get(s.classId) ?? '—'
        }));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load subjects', 'Close', { duration: 3000 });
      }
    });
  }

  openAdd() {
    this.dialog.open(SubjectFormComponent, {
      data: { subject: null, classes: this.classes() },
      width: '480px'
    }).afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(row: SubjectRow) {
    this.dialog.open(SubjectFormComponent, {
      data: { subject: row, classes: this.classes() },
      width: '480px'
    }).afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(row: SubjectRow) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Subject',
        message: `Are you sure you want to delete "${row.name}"?`
      },
      width: '360px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.svc.delete(row.id).subscribe({
        next: () => this.load(),
        error: () => this.snackBar.open('Failed to delete subject', 'Close', { duration: 3000 })
      });
    });
  }
}
