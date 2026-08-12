import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { Habilidade } from '../../shared/models/habilidade.interface';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { Router } from '@angular/router';
import { CadastroService } from '../../shared/services/cadastro-service';
import { Idioma } from '../../shared/models/idioma.interface';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ChipComponent,
    NgIcon,
  ],
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss'],
})
export class PerfilFormComponent implements OnInit {
  perfilForm!: FormGroup;
  fotoPreview!: string | ArrayBuffer | null;
  caracteresRestantes: number = 70;

  habilidades: Habilidade[] = [
    { nome: 'Fullstack', selecionada: false },
    { nome: 'Front-end', selecionada: false },
    { nome: 'Backend', selecionada: false },
    { nome: 'React', selecionada: false },
    { nome: 'Angular', selecionada: false },
    { nome: 'C#', selecionada: false },
    { nome: 'Java', selecionada: false },
    { nome: 'Rust', selecionada: false },
    { nome: 'Python', selecionada: false },
    { nome: 'Node', selecionada: false },
    { nome: 'Ruby', selecionada: false },
  ];

  niveisIdioma: string[] = [
    'Básico',
    'Intermediário',
    'Avançado',
    'Fluente',
    'Nativo',
  ];

  idiomas: string[] = ['Português', 'Inglês', 'Espanhol'];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cadastroService: CadastroService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.perfilForm.get('resumo')?.valueChanges.subscribe((resumo) => {
      this.caracteresRestantes = 70 - resumo.length;
    });
  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/dados-pessoais']);
  }

  onProximo(): void {
    if (this.perfilForm.valid) {
      this.salvarDadosAtuais();
      this.router.navigate(['/cadastro/confirmacao']);
    }
  }

  onFotoSelecionada(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result;
        this.perfilForm.patchValue({ foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  toggleHabilidade(habilidade: Habilidade): void {
    habilidade.selecionada = !habilidade.selecionada;

    const habilidadesSelecionadas = this.habilidades
      .filter((h) => h.selecionada)
      .map((h) => h.nome);

    this.perfilForm.patchValue({ habilidadesSelecionadas });
  }

  get idiomasArray(): FormArray {
    return this.perfilForm.get('idiomas') as FormArray;
  }

  removerIdioma(index: number): void {
    if (index == 0 && this.idiomasArray.at(0).get('nome')?.value == 'Português')
      return;

    this.idiomasArray.removeAt(index);
  }

  adicionarIdioma(nome: string = '', nivel: string = ''): void {
    const idiomaForm = this.formBuilder.group({
      nome: [nome, Validators.required],
      nivel: [nivel, Validators.required],
    });
    this.idiomasArray.push(idiomaForm);
  }

  private inicializarFormulario() {
    this.perfilForm = this.formBuilder.group({
      foto: [''],
      resumo: ['', [Validators.required, Validators.maxLength(70)]],
      habilidadesSelecionadas: [[]],
      idiomas: this.formBuilder.array([]),
      portfolio: ['', Validators.pattern('https?://.+')],
      linkedin: ['', Validators.pattern('https?://(www\\.)?linkedin\\.com/.+')],
    });

    this.adicionarIdioma('Português', 'Nativo');
  }

  private extrairIdiomas(): Idioma[] {
    return this.idiomasArray.controls.map((control) => {
      return {
        nome: control.get('nome')?.value,
        nivel: control.get('nivel')?.value,
      };
    });
  }

  private salvarDadosAtuais(): void {
    const formValue = this.perfilForm.value;

    this.cadastroService.updateCadastroData({
      foto: this.fotoPreview ?? null,
      resumo: formValue.resumo,
      habilidadesSelecionadas: formValue.habilidadesSelecionadas,
      idiomas: this.extrairIdiomas(),
      portfolio: formValue.portfolio,
      linkedin: formValue.linkedin,
    });
  }
}
