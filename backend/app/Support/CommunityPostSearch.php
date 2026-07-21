<?php

namespace App\Support;

use App\Models\CommunityPost;
use Illuminate\Database\Eloquent\Builder;

class CommunityPostSearch
{
    public static function categoryLabel(string $category): string
    {
        return str($category)->replace('_', ' ')->title()->toString();
    }

    public static function matchCategory(?string $term): ?string
    {
        if (! $term || trim($term) === '') {
            return null;
        }

        $normalized = strtolower(trim($term));

        foreach (CommunityPost::CATEGORIES as $category) {
            $label = strtolower(self::categoryLabel($category));
            $slug = str_replace('_', ' ', $category);

            if (in_array($normalized, [$label, $slug, $category], true)) {
                return $category;
            }

            if (str_contains($normalized, $label) || str_contains($label, $normalized)) {
                return $category;
            }

            if (str_contains($normalized, $slug) || str_contains($slug, $normalized)) {
                return $category;
            }
        }

        return null;
    }

    public static function isCategoryLabelFor(?string $search, string $category): bool
    {
        if (! $search || trim($search) === '') {
            return false;
        }

        return self::matchCategory($search) === $category;
    }

    /**
     * @param  Builder<CommunityPost>  $query
     */
    public static function apply(Builder $query, ?string $search, ?string $category = null): void
    {
        $term = $search !== null ? trim($search) : '';

        if ($category) {
            $query->where('category', $category);

            if ($term !== '' && ! self::isCategoryLabelFor($term, $category)) {
                $query->where(function ($inner) use ($term) {
                    $inner->where('title', 'like', "%{$term}%")
                        ->orWhere('content', 'like', "%{$term}%");
                });
            }

            return;
        }

        if ($term === '') {
            return;
        }

        $matchedCategory = self::matchCategory($term);

        $query->where(function ($inner) use ($term, $matchedCategory) {
            $inner->where('title', 'like', "%{$term}%")
                ->orWhere('content', 'like', "%{$term}%");

            if ($matchedCategory) {
                $inner->orWhere('category', $matchedCategory);
            }
        });
    }
}
