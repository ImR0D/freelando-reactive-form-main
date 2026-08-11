import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { Habilidade } from '../../shared/models/habilidade.interface';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { Router } from '@angular/router';
import { CadastroService } from '../../shared/services/cadastro-service';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ChipComponent],
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss'],
})
export class PerfilFormComponent implements OnInit {
  perfilForm!: FormGroup;
  fotoPreview!: string | ArrayBuffer | null;

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

  private inicializarFormulario() {
    this.perfilForm = this.formBuilder.group({
      foto: [''],
      resumo: [''],
      habilidadesSelecionadas: [[]],
      idiomas: this.formBuilder.array([]),
      portfolio: [''],
      linkedin: [''],
    });
  }

  private salvarDadosAtuais(): void {
    const formValue = this.perfilForm.value;

    this.cadastroService.updateCadastroData({
      foto: this.fotoPreview ?? null,
      resumo: formValue.resumo,
      habilidadesSelecionadas: formValue.habilidadesSelecionadas,
      idiomas: [],
      portfolio: formValue.portfolio,
      linkedin: formValue.linkedin,
    });
  }
}
