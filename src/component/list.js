import React, { Component, PureComponent } from 'react';
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

export class List extends PureComponent {
  render() {
    const { data, renderItem, renderHeader } = this.props;
    return (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={renderHeader}
        initialNumToRender={15}
      />
    );
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
    height: 40,
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
