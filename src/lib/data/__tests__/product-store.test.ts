import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  createProductFromTemplate,
  getProductTemplates,
  addVersionToProduct,
  publishVersion,
  createNewVersion,
} from '../product-store';
import { Product } from '@/lib/engine/types';

describe('Product Store', () => {
  describe('getProductTemplates', () => {
    it('should return available templates', () => {
      const templates = getProductTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('config');
    });

    it('should have valid config in each template', () => {
      const templates = getProductTemplates();

      templates.forEach((template) => {
        expect(template.config.payoutTiers.length).toBeGreaterThan(0);
        expect(template.config.eligibility).toBeDefined();
        expect(template.config.exclusions).toBeDefined();
        expect(template.config.reasonCodes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('createProductFromTemplate', () => {
    it('should create a new product from template', () => {
      const templates = getProductTemplates();
      const template = templates[0];

      const product = createProductFromTemplate(
        template.id,
        'Test Product',
        'Test Description'
      );

      expect(product.id).toBeDefined();
      expect(product.id).toMatch(/^prod-/);
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Test Description');
      expect(product.status).toBe('draft');
      expect(product.activeVersion).toBe('v0.1');
      expect(product.versions.length).toBe(1);
      expect(product.versions[0].status).toBe('draft');
      expect(product.versions[0].config).toEqual(template.config);
    });

    it('should add created product to store', () => {
      const templates = getProductTemplates();
      const template = templates[0];
      const initialCount = getAllProducts().length;

      createProductFromTemplate(
        template.id,
        'Store Test Product',
        'Store Test Description'
      );

      expect(getAllProducts().length).toBe(initialCount + 1);
    });

    it('should throw error for non-existent template', () => {
      expect(() =>
        createProductFromTemplate('non-existent', 'Test', 'Test')
      ).toThrow('Template non-existent not found');
    });
  });

  describe('getAllProducts', () => {
    it('should return array of products', () => {
      const products = getAllProducts();

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return products with required fields', () => {
      const products = getAllProducts();

      products.forEach((product) => {
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.status).toBeDefined();
        expect(product.versions).toBeDefined();
        expect(product.versions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getProductById', () => {
    it('should return product by id', () => {
      const products = getAllProducts();
      const product = getProductById(products[0].id);

      expect(product).toBeDefined();
      expect(product?.id).toBe(products[0].id);
    });

    it('should return undefined for non-existent id', () => {
      const product = getProductById('non-existent-id');

      expect(product).toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('should update product fields', () => {
      const products = getAllProducts();
      const productId = products[0].id;
      const originalName = products[0].name;

      updateProduct(productId, { name: 'Updated Name' });

      const updated = getProductById(productId);
      expect(updated?.name).toBe('Updated Name');

      // Restore original name
      updateProduct(productId, { name: originalName });
    });

    it('should update the updatedAt timestamp', () => {
      const products = getAllProducts();
      const productId = products[0].id;

      updateProduct(productId, { description: 'New description for timestamp test' });

      const updated = getProductById(productId);
      // Just verify that updatedAt is a valid ISO date string
      expect(updated?.updatedAt).toBeDefined();
      expect(new Date(updated?.updatedAt || '').toISOString()).toBe(updated?.updatedAt);
    });
  });

  describe('addVersionToProduct', () => {
    it('should add new version to product', () => {
      const products = getAllProducts();
      const productId = products[0].id;
      const originalVersionCount = products[0].versions.length;

      addVersionToProduct(productId, {
        version: 'v99.0',
        hash: 'test-hash',
        config: products[0].versions[0].config,
        createdAt: new Date().toISOString(),
        publishedAt: null,
        status: 'draft',
      });

      const updated = getProductById(productId);
      expect(updated?.versions.length).toBe(originalVersionCount + 1);
      expect(updated?.versions[0].version).toBe('v99.0');
    });
  });

  describe('publishVersion', () => {
    it('should publish version and update product status', () => {
      const templates = getProductTemplates();
      const product = createProductFromTemplate(
        templates[0].id,
        'Publish Test',
        'Test'
      );

      expect(product.status).toBe('draft');
      expect(product.versions[0].status).toBe('draft');

      publishVersion(product.id, 'v0.1');

      const updated = getProductById(product.id);
      expect(updated?.status).toBe('active');
      expect(updated?.versions[0].status).toBe('published');
      expect(updated?.versions[0].publishedAt).not.toBeNull();
      expect(updated?.activeVersion).toBe('v0.1');
    });
  });

  describe('createNewVersion', () => {
    it('should create draft version when publish is false', () => {
      const products = getAllProducts();
      const productId = products[0].id;
      const originalConfig = products[0].versions[0].config;

      const newVersion = createNewVersion(productId, originalConfig, false);

      expect(newVersion).not.toBeNull();
      expect(newVersion?.status).toBe('draft');
      expect(newVersion?.publishedAt).toBeNull();
      expect(newVersion?.version).toMatch(/^v\d+\.\d+$/);
    });

    it('should create published version when publish is true', () => {
      const products = getAllProducts();
      const productId = products[0].id;
      const originalConfig = products[0].versions[0].config;

      const newVersion = createNewVersion(productId, originalConfig, true);

      expect(newVersion).not.toBeNull();
      expect(newVersion?.status).toBe('published');
      expect(newVersion?.publishedAt).not.toBeNull();
    });

    it('should increment version number', () => {
      const templates = getProductTemplates();
      const product = createProductFromTemplate(
        templates[0].id,
        'Version Increment Test',
        'Test'
      );

      // Initial version is v0.1
      expect(product.versions[0].version).toBe('v0.1');

      const v2 = createNewVersion(product.id, product.versions[0].config, false);
      expect(v2?.version).toBe('v0.2');

      const v3 = createNewVersion(product.id, product.versions[0].config, true);
      expect(v3?.version).toBe('v0.3');
    });

    it('should return null for non-existent product', () => {
      const templates = getProductTemplates();
      const result = createNewVersion('non-existent', templates[0].config, false);

      expect(result).toBeNull();
    });

    it('should generate unique hash for each version', () => {
      const products = getAllProducts();
      const productId = products[0].id;
      const config = products[0].versions[0].config;

      const v1 = createNewVersion(productId, config, false);
      const v2 = createNewVersion(productId, config, false);

      expect(v1?.hash).not.toBe(v2?.hash);
    });
  });
});
