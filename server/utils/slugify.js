// Generate a URL-friendly slug from a name and ID
// Example: "Santhosh K" + "695f938b8bca459322c3d978" => "santhosh-k-d978"
const generateSlug = (name, id) => {
    const slugifiedName = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-');     // Remove consecutive hyphens
    
    const idSuffix = id.slice(-4); // Last 4 characters of the ID
    
    return `${slugifiedName}-${idSuffix}`;
};

// Parse a slug to extract the ID suffix
// Example: "santhosh-k-d978" => "d978"
const parseSlug = (slug) => {
    const parts = slug.split('-');
    return parts[parts.length - 1]; // Return last part (ID suffix)
};

module.exports = { generateSlug, parseSlug };
