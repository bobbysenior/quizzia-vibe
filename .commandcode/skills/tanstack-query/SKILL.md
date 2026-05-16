---
name: tanstack-query
description: Patterns TanStack Query (React Query v5) — clés hiérarchiques, hooks, mutations, cache, erreurs, perf.
alwaysApply: true
---

# Règles TanStack Query (projet IsodomAi)

## Architecture et organisation

### Structure de fichiers recommandée

```
lib/hooks/
├── queries/          # Hooks de lecture (GET)
├── mutations/        # Hooks d’écriture (POST/PUT/DELETE)
├── queryKeys.ts      # Clés centralisées
└── index.ts          # Barrel exports (optionnel)
```

Adapter les chemins si le dépôt utilise une autre arborescence, mais garder la **séparation queries / mutations / query keys**.

### Query keys — nomenclature hiérarchique

```typescript
// Bon — structure hiérarchique
queryKeys.contactLists.all; // ['contact-lists']
queryKeys.contactLists.filtered(params); // ['contact-lists', 'filtered', params]
queryKeys.contactLists.detail(id); // ['contact-lists', 'detail', id]

// À éviter — clés plates ou ambiguës
['all-contact-lists'];
['filtered-contact-lists-true'];
```

### QueryClient — valeurs par défaut raisonnables

- `staleTime` : selon la fraîcheur métier (souvent plusieurs minutes pour du dashboard).
- `gcTime` : au-dessus de `staleTime` si tu veux garder les données en mémoire après unmount.
- `retry` : limité (ex. 2), avec logique qui **évite** de retry sur 401/403.

## Patterns de requêtes

### Hook de base

```typescript
export function useContactLists() {
  return useQuery({
    queryKey: queryKeys.contactLists.all,
    queryFn: fetchContactLists,
  });
}
```

### Hook dérivé (paramètres, logique métier)

```typescript
export function useFilteredContactLists(showDeleted = false) {
  return useQuery({
    queryKey: queryKeys.contactLists.filtered(showDeleted),
    queryFn: async () => {
      const allLists = await fetchContactLists();
      return processLists(allLists, showDeleted);
    },
  });
}
```

### Mutations et invalidation

```typescript
export function useDeleteContactList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContactList,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contactLists.all,
      });
    },
  });
}
```

## UI : loading, erreur, pending

- Gérer explicitement `isLoading` / `isPending` (mutations) et `error`.
- Préférer des squelettes ou états vides cohérents avec le design système du projet.

## Performance et cache

### Invalidation

- Invalider par **préfixe de clé** quand plusieurs vues partagent la même ressource (ex. `['contact-lists']`).
- Éviter `queryClient.clear()` sauf cas exceptionnel (logout global, reset complet).

### Prefetch

```typescript
function prefetchContactDetail(queryClient: QueryClient, listId: number) {
  queryClient.prefetchQuery({
    queryKey: queryKeys.contactLists.detail(listId),
    queryFn: () => fetchContactListDetail(listId),
    staleTime: 10 * 60 * 1000,
  });
}
```

### Mises à jour en arrière-plan

Pour données qui doivent rester fraîches, utiliser `refetchInterval` / `refetchIntervalInBackground` avec parcimonie (charge serveur, batterie).

## Optimisations UX

- **Mises à jour optimistes** pour les actions fréquentielles quand le rollback est gérable.
- Utiliser `select` sur `useQuery` pour dériver des vues légères sans recalculs inutiles côté composant.

## Erreurs et retry

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});
```

Pour remonter les erreurs vers une Error Boundary React, utiliser **`throwOnError: true`** sur la query (TanStack Query v5), ou gérer `error` au niveau du composant.

## DevTools

- En développement uniquement : `@tanstack/react-query-devtools`, derrière une garde `process.env.NODE_ENV === 'development'` si besoin.

## Couche données

- Centraliser les appels Supabase / API dans des **fonctions services** (ex. `campaignService.getById`), appelées depuis `queryFn` / `mutationFn`, pas de SQL ou client lourd directement dans les composants.

## Checklist avant un nouveau hook

- Clé hiérarchique définie (idéalement dans `queryKeys.ts`).
- Types TypeScript complets pour les entrées/sorties.
- Stratégie d’erreur et de retry cohérente.
- Invalidation ou mise à jour du cache après mutations.
- États de chargement / erreur testés ou identifiables dans l’UI.

## Ressources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)
- [Best practices](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
