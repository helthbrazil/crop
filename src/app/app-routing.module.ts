import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { PessoaDetailComponent } from './pessoa/pessoa-detail/pessoa-detail.component';
import { PessoaSearchComponent } from './pessoa/pessoa-search/pessoa-search.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { EnviarFotosComponent } from './fotos/enviar-fotos/enviar-fotos.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'fotos/enviar',
    pathMatch: 'full'
  },
  {
    path: 'fotos/enviar',
    component: EnviarFotosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pessoa/detail',
    component: PessoaDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pessoa/detail/:id',
    component: PessoaDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pessoa/search',
    component: PessoaSearchComponent,
    canActivate: [AuthGuard]
  },
   {
    path: 'pessoa/excluir',
    component: PessoaSearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    data: { blankTemplate: true}
  },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
