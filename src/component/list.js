import React, { PureComponent } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { color } from './style';

//
// List Content
//

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 50,
    paddingRight: 50,
  },
});

export const ListContent = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

ListContent.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
};

//
// List
//

const ITEM_HEIGHT = 40;
const SEPARATOR_HEIGHT = 0;
const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
};

export class List extends PureComponent {
  render() {
    const { data, renderItem, renderHeader } = this.props;
    return (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={renderHeader}
        initialNumToRender={15}
        legacyImplementation={false}
        numColumns={1}
        refreshing={false}
        viewabilityConfig={VIEWABILITY_CONFIG}
        getItemLayout={this._getItemLayout}
      />
    );
  }

  _getItemLayout(data, index) {
    const length = ITEM_HEIGHT;
    const separator = SEPARATOR_HEIGHT;
    const header = ITEM_HEIGHT;
    return { length, offset: (length + separator) * index + header, index };
  }
}

List.propTypes = {
  data: PropTypes.array.isRequired,
  renderHeader: PropTypes.func,
  renderItem: PropTypes.func.isRequired,
};

//
// List Item
//

const itemStyles = StyleSheet.create({
  item: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    boxShadow: `0 0.5px ${color.greyBorder}`,
  },
});

export class ListItem extends PureComponent {
  render() {
    const { onSelect, children, style } = this.props;
    return onSelect ? (
      <TouchableOpacity onPress={onSelect} style={[itemStyles.item, style]}>
        {children}
      </TouchableOpacity>
    ) : (
      <View style={[itemStyles.item, style]}>{children}</View>
    );
  }
}

ListItem.propTypes = {
  onSelect: PropTypes.func,
  children: PropTypes.node,
  style: ViewPropTypes.style,
};

//
// List Header
//

const headStyles = StyleSheet.create({
  head: {
    boxShadow: '0',
  },
});

export const ListHeader = ({ style, children }) => (
  <View style={[itemStyles.item, headStyles.head, style]}>{children}</View>
);

ListHeader.propTypes = {
  children: PropTypes.node,
  style: ViewPropTypes.style,
};
