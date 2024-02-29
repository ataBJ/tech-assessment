class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    const criteriaKeys = Object.keys(criteria);
    let isFulFilled = true;
    let i = 0;

    while (isFulFilled && i < criteriaKeys.length) {
      const key = criteriaKeys[i];

      // Normalize critetia keys to work with an Array anyway
      const criteriaSubKeys =
        typeof criteria[key] === 'object'
          ? Object.keys(criteria[key])
          : [criteria[key]];

      if (!key.includes('.')) {
        // If one of the subcriterias fails then we consider the criteria as unfulfilled
        isFulFilled = !criteriaSubKeys.some(
          (criteriaSubKey) =>
            !EligibilityService.checkFulfilment(
              cart[key],
              criteria[key]?.[criteriaSubKey],
              criteriaSubKey
            )
        );
      } else {
        const [key1, key2] = key.split('.');

        // Normalize data to work with an Array anyway
        const cartValues = Array.isArray(cart[key1])
          ? cart[key1]
          : [cart[key1]];

        // If one of the sub criterias fails then then we consider the criteria as unfulfilled
        isFulFilled = cartValues.some(
          (cartValue) =>
            !criteriaSubKeys.some((criteriaSubKey) => {
              !EligibilityService.checkFulfilment(
                cartValue[key2],
                criteria[key][criteriaSubKey],
                criteriaSubKey
              );
            })
        );
      }

      ++i;
    }

    return isFulFilled;
  }

  static checkFulfilment(cartValue, conditionValue, conditionKey) {
    switch (conditionKey) {
      case 'gt':
        return cartValue > conditionValue;
      case 'gte':
        return cartValue >= conditionValue;
      case 'lt':
        return cartValue < conditionValue;
      case 'lte':
        return cartValue <= conditionValue;
      case 'in':
        return conditionValue.includes(cartValue);
      case 'and':
        return !Object.keys(conditionValue).some(
          (k) =>
            !EligibilityService.checkFulfilment(cartValue, conditionValue[k], k)
        );
      case 'or':
        return Object.keys(conditionValue).some((k) =>
          EligibilityService.checkFulfilment(cartValue, conditionValue[k], k)
        );
      default:
        return cartValue == conditionKey;
    }
  }
}

module.exports = {
  EligibilityService,
};
