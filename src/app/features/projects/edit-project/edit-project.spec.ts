import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProject } from './edit-project';

describe('EditProject', () => {
  let component: EditProject;
  let fixture: ComponentFixture<EditProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [EditProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
