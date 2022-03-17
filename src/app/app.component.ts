import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sopaLetras';

  public form!: FormGroup;
  public estado!: string;
  public formMatriz!: FormGroup;
  public formPalabra!: FormGroup;

  private controlPalabra!: FormControl;

  private infoPalabra = {};

  public matrizData: string[][] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      tamX: ['', [Validators.required, Validators.min(1)]],
      tamY: ['', [Validators.required, Validators.min(1)]],
    });

    this.formMatriz = this.fb.group({
      filas: this.fb.array([{
        columnas: this.fb.array([], [Validators.required, Validators.pattern('/^[A-Z]+$/i')]),
      }])
    });

    this.formPalabra = this.fb.group({
      palabra: ['', [Validators.required]]
    })
  }

  public get tamX(): number {
    return this.form.get('tamX')?.value;
  }

  public get tamY(): number {
    return this.form.get('tamY')?.value;
  }

  public get filas(): FormArray {
    return this.formMatriz.controls['filas'] as FormArray;
  }

  public columas(pos: number): FormArray {
    return this.filas.get([pos]) as FormArray
  }

  public celda(i: number, j: number): FormControl {
    return this.columas(i).get([j]) as FormControl;
  }

  public get palabra(): FormControl {
    return this.formPalabra.controls['palabra'] as FormControl
  }

  /**
   * Se pasa a crear los controles necesarios dado el nxm
   */
  public generarControls(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('entró');

      return;
    }
    let filas: FormArray = this.fb.array([]); // Reinicializa el formulario (matriz)

    for (let i = 0; i < this.tamX; i++) {
      let arrayColumnas: FormArray = this.fb.array([]); // Se crean las columas

      for (let j = 0; j < this.tamY; j++) {
        let celda: FormControl = new FormControl('', [Validators.required, Validators.maxLength(1)])
        arrayColumnas.push(celda);
      }
      filas.push(arrayColumnas); // Crear nuevas filas
    }
    this.formMatriz = this.fb.group({ filas });
  }

  /**
   * Comparar la palabra dada con elementos en fila
   * @param fila 
   * @param columna 
   * @param infoPalabra 
   * @returns boolean
   */
  public comparar(fila: number, columna: number, infoPalabra: any): boolean {
    
    if(this.busquedaFilas(fila, columna, infoPalabra) == true) {
      console.log('Encontrado con filas');
      return true;

    } else if (this.busquedaColumnas(fila, columna, infoPalabra) == true) {
      console.log('Encontrado con columnas');
      return true;

    } else {
      return false;
    }
  }

  public busquedaFilas(fila: number, columna: number, infoPalabra: any) {
    let element = this.matrizData[fila][columna]; //elemento actual
    let distancia = columna + infoPalabra.tamanio;
    let posSemejante = this.matrizData[fila][distancia - 1];//pos últ coinc

    if ((element == infoPalabra.primeraL) //elemento vs primera letra
      && (posSemejante === infoPalabra.ultimaL) //elemento vs más z pos con la última letra
      && !(infoPalabra.tamanio > this.tamY) //no superar
    ) {
      let pos = 0;
      for (let i = columna; i < distancia; i++) {
        if (infoPalabra.valor[pos] !== this.matrizData[fila][i]) { //palabra vs posic y
          pos = 0;
          return false;
        }
        pos++;
        if(pos == distancia){
          console.log(`Encontrado en (${fila},${pos-1})`); 
        }
      }
      return true;
    } else {
      return false;
    }
  }

  public busquedaColumnas(fila: number, columna: number, infoPalabra: any) {
    let element = this.matrizData[fila][columna]; //elemento actual
    let distancia = fila + infoPalabra.tamanio;
    let posSemejante = this.matrizData[distancia-1][columna];//pos últ coinc

    if ((element == infoPalabra.primeraL) //elemento vs primera letra
      && (posSemejante === infoPalabra.ultimaL) //elemento vs más z pos con la última letra
      && !(infoPalabra.tamanio > this.tamX) //no superar
    ) {
      let pos = 0;
      for (let i = fila; i < distancia; i++) {
        if (infoPalabra.valor[pos] !== this.matrizData[i][columna]) { //palabra vs posic y
          pos = 0;
          return false;
        }
        pos++;
        if(pos == distancia){
          console.log(`Encontrado en (${pos-1},${columna})`); 
        }
      }
      return true;
    } else {
      return false;
    }
  }

  public submitForm(): void {
    this.matrizData = this.formMatriz.value.filas;
    console.table(this.matrizData);
  }

  //Ejecuta la búsqueda de la palabra dada
  public buscarPalabra(): void {

    this.infoPalabra = { //Algunos valores a usar de la palabra
      valor: this.palabra.value,
      tamanio: this.palabra.value.length,
      primeraL: this.palabra.value[0],
      ultimaL: this.palabra.value[this.palabra.value.length - 1],
    }

    let encontrado: boolean = false;

    for (let i = 0; i < this.matrizData.length; i++) {
      const x = this.matrizData[i];

      for (let j = 0; j < x.length; j++) {
        const y = x[j];

        encontrado = this.comparar(i, j, this.infoPalabra);
        if (encontrado === true) {
          return;
        }
      }
    }
  }

  public isFieldInValidF1(campo: string) {
    (this.form.controls[campo].errors
      && this.form.controls[campo].touched) ? 'true' : 'FormControl';
  }

  public isFieldInValidF2(campo: string) {
    this.formPalabra.controls[campo].errors
      && this.formPalabra.controls[campo].touched;
  }

  public isFieldInValidF3(campo: string) {
    return this.formMatriz.controls[campo].errors
      && this.formMatriz.controls[campo].touched;
  }
}
