interface MunicipalityScopeCopy {
  knowledgeHubTitle: string
  knowledgeHubDescription: string
  knowledgeCenterTitle: string
  knowledgeCenterDescription: string
  programsTitle: string
  programsDescription: string
  featuredProgramsDescription: string
  guidesDescription: string
}

/** Copy for municipality-scoped Knowledge Center and Government Programs sections. */
export function getMunicipalityScopeCopy(municipalityName?: string | null): MunicipalityScopeCopy {
  if (municipalityName) {
    return {
      knowledgeHubTitle: `Agricultural advisories for ${municipalityName}`,
      knowledgeHubDescription: `Public advisories, guides, and resources for ${municipalityName} farmers — plus province-wide information relevant to your municipality.`,
      knowledgeCenterTitle: `Knowledge Hub — ${municipalityName}`,
      knowledgeCenterDescription: `Advisories and guides for ${municipalityName}, together with province-wide agricultural resources.`,
      programsTitle: `Government Programs — ${municipalityName}`,
      programsDescription: `Subsidies, training, loans, and other assistance for ${municipalityName} farmers, including province-wide programs.`,
      featuredProgramsDescription: `Support programs available to farmers in ${municipalityName} and across Ilocos Norte.`,
      guidesDescription: `Guides and articles for ${municipalityName} and province-wide topics.`,
    }
  }

  return {
    knowledgeHubTitle: 'Learn from municipalities across Ilocos Norte',
    knowledgeHubDescription: 'Public agricultural advisories on pesticide use, crop disease, soil management, planting calendars, and more — like, comment, and share with fellow farmers.',
    knowledgeCenterTitle: 'Knowledge Hub',
    knowledgeCenterDescription: 'Public agricultural advisories from municipalities across Ilocos Norte, plus guides and reference articles.',
    programsTitle: 'Support built for your farm',
    programsDescription: 'Browse subsidies, training, loans, and other assistance programs available across Ilocos Norte.',
    featuredProgramsDescription: 'Subsidies, training, loans, and more — discover programs that can help your farm grow.',
    guidesDescription: 'Guides and reference articles from across the province.',
  }
}
