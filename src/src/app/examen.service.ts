import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BegrippenService } from './begrippen.service';

export interface ExamenVraag {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  reference: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExamenService {
  constructor(
    private http: HttpClient,
    private begrippenService: BegrippenService
  ) {}

  getVragen(): Observable<ExamenVraag[]> {
    // Get the current file path from BegrippenService
    const currentPath = this.begrippenService.currentFilePath();
    
    // Determine the examen file path based on the current file
    let examenPath = '/content/ak/h4/examen.json'; // Default fallback
    
    if (currentPath) {
      // Replace the filename (e.g., "h3.json") with "examen.json"
      if (currentPath.includes('bio/')) {
        // For biology files: extract directory and use examen.json
        const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
        examenPath = `/content/${directory}/examen.json`;
      }
    }
    
    return this.http.get<ExamenVraag[]>(examenPath);
  }
}
